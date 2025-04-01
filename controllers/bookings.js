const express = require('express');
const { verifyUser } = require('../middlewares/middleware');
const { supabase } = require('../supabase');
const { putJob } = require('../lib/utils');

const router = express();

router.post('/', verifyUser, async (req, res) => {
  const {
    trip_id,
    return_trip_id,
    status = 'confirmed',
    email,
    phone,
    price,
    payment_mode,
    passengers,
    no_of_passengers,
    booking_type
  } = req.body;
  console.log(req.user);
  const userId = req.user.user.id;

  if (!trip_id || !price || !payment_mode || !passengers || !no_of_passengers) {
    return res.status(400).json({ message: 'Required fields are missing' });
  }

  try {
    // Insert new booking into the booking table
    const { data: newBooking, error: bookingError } = await supabase
      .from('bookings')
      .insert([
        {
          trip_id,
          user_id: userId,
          return_trip_id,
          status,
          email,
          phone,
          price,
          payment_mode,
          booking_type: booking_type? booking_type : 'economy'
        }
      ])
      .single().select();

    if (bookingError) {
      console.error("Booking Error:", bookingError);
      return res.status(500).json({ message: 'Error creating new booking', error: bookingError.message });
    }


    // Add passengers to the passengers table, associating with the new booking ID
    const passengerPromises = passengers.map(async (passenger) => {
      const { firstName, lastName, email: passengerEmail, gender, dateOfBirth } = passenger;

      // Insert each passenger's details into the database
      const { data: insertedPassenger, error: passengerError } = await supabase
        .from('passengers')
        .insert([
          {
            booking_id: newBooking.id, // Use the ID of the new booking
            first_name: firstName,
            last_name: lastName,
            email: passengerEmail || email, // Default to booking email if not provided
            gender,
            dob: dateOfBirth
          }
        ]).select();

      if (passengerError) {
        console.error("Passenger Error:", passengerError);
        return res.status(500).json({ message: 'Error inserting passengers', error: passengerError.message });
      }
      return insertedPassenger;
    });

    // Wait for all passenger inserts to complete
    await Promise.all(passengerPromises);

    // Respond with success
    await putJob({email: email, subject: 'Booking Confirmed', booking_id: newBooking.id}, 'flight_bookings')
    res.status(200).json({ message: 'Booking created and passengers added successfully', newBooking });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/', verifyUser, async (req, res) => {
  const userId = req.user.user.id;

  try {
    // Fetch all bookings for the authenticated user
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId); // Ensure to filter bookings by the authenticated user's ID

    if (error) {
      console.error("Error fetching bookings:", error);
      return res.status(500).json({ message: 'Error fetching bookings', error: error.message });
    }

    // If there are no bookings, return an empty array
    res.status(200).json({ bookings: bookings || [] });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.patch('/:bookingId/cancel', verifyUser, async (req, res) => {
  const userId = req.user.user.id;
  const { bookingId } = req.params;  // Get the booking ID from the URL parameter

  try {
    // Check if the booking exists and belongs to the authenticated user
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .eq('id', bookingId)  // Ensure the booking belongs to the authenticated user
      .single();  // Only expect one result

    if (fetchError || !booking) {
      return res.status(404).json({ message: 'Booking not found or does not belong to the authenticated user' });
    }

    // Update the booking status to "cancelled"
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })  // Update the status to 'cancelled'
      .eq('id', bookingId)  // Identify the booking by its ID
      .eq('user_id', userId)  // Ensure it belongs to the authenticated user
      .single().select();  // Return only a single updated record

    if (updateError) {
      console.error("Error updating booking:", updateError);
      return res.status(500).json({ message: 'Error updating booking status', error: updateError.message });
    }

    // Return the updated booking data
    res.status(200).json({ booking: updatedBooking });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


router.get('/:booking_id', async (req, res) => {

  const { booking_id } = req.params;

  try {
    // Fetch a specific booking for the authenticated user by booking_id
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id,
        
        trip_id (
          id,
          flight_id (
            id,
            flight_number,
            airline_id (
              id,
              name
            )
          ),
          departure,
          arrival,
          origin (
            id,
            name,
            code
          ),
          destination (
            id,
            name,
            code
          )
        ),
        status,
        return_trip_id (
          id,
          flight_id (
            id,
            flight_number,
            airline_id (
              id,
              name
            )
          ),
          departure,
          arrival,
          origin (
            id,
            name,
            code
          ),
          destination (
            id,
            name,
            code
          )
        ),
        email,
        phone,
        payment_mode,
        price,
        booking_type
      `)
      .eq('id', booking_id)  // Filter by both user_id and booking_id to ensure correct data
      .single();

    if (bookingError) {
      console.error("Error fetching booking:", bookingError);
      return res.status(500).json({ message: 'Error fetching booking', error: bookingError.message });
    }

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Fetch the passengers related to this booking
    const { data: passengers, error: passengersError } = await supabase
      .from('passengers')
      .select(`
        id,
        first_name,
        last_name,
        dob,
        gender
      `)
      .eq('booking_id', booking_id); // Assuming the `booking_id` is the foreign key in the `passengers` table

    if (passengersError) {
      console.error("Error fetching passengers:", passengersError);
      return res.status(500).json({ message: 'Error fetching passengers', error: passengersError.message });
    }

    // Add the passengers to the booking object before sending the response
    booking.passengers = passengers;

    // Send the booking data along with the passenger information
    res.status(200).json({ booking });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});





module.exports = router;