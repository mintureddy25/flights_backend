import redis
import smtplib
import requests
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configuration from environment variables
REDIS_HOST = os.getenv('REDIS_HOST')
REDIS_PORT = int(os.getenv('REDIS_PORT'))
REDIS_USERNAME = os.getenv('REDIS_USERNAME')
REDIS_PASSWORD = os.getenv('REDIS_PASSWORD')
EMAIL_USER = os.getenv('EMAIL_USER')
EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD')
EMAIL_SMTP_SERVER = os.getenv('EMAIL_SMTP_SERVER')
EMAIL_SMTP_PORT = os.getenv('EMAIL_SMTP_PORT')
API_URL = os.getenv('API_URL')

BOOKINGS_API_URL = f"{API_URL}/bookings/{{id}}"

# Create Redis client
client = redis.StrictRedis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True, username=REDIS_USERNAME,
                            password=REDIS_PASSWORD)

def send_email(email, subject, booking_data):
    # Check if 'booking' key exists
    if 'booking' not in booking_data:
        print(f"Error: 'booking' key missing in booking data.")
        return

    booking = booking_data['booking']  # Access the booking object

    # Check if 'passengers' key exists
    if 'passengers' not in booking:
        print(f"Error: 'passengers' key missing in booking data for booking ID {booking.get('id')}")
        return

    # Start formatting the email body
    body = (
        f"Hi {booking['passengers'][0]['first_name']} {booking['passengers'][0]['last_name']},\n\n"
        f"Your booking is confirmed. Below are your booking details:\n\n"
        f"Booking ID: {booking['id']}\n"
        f"Price: ₹{booking['price']}\n"
        f"Booking Type: {booking['booking_type']}\n"
        f"Payment Mode: {booking['payment_mode']}\n"
        f"Phone: {booking['phone']}\n\n"
        
        # Outbound trip details
        f"Outbound Trip:\n"
        f"  Flight Number: {booking['trip_id']['flight_id']['flight_number']}\n"
        f"  Airline: {booking['trip_id']['flight_id']['airline_id']['name']}\n"
        f"  Departure: {booking['trip_id']['departure']} from {booking['trip_id']['origin']['name']}\n"
        f"  Arrival: {booking['trip_id']['arrival']} at {booking['trip_id']['destination']['name']}\n\n"
    )

    # Add a section for the list of passengers and their gender
    body += f"Passengers List:\n"
    body += f"{'Name':<30}{'Gender':<10}\n"
    body += "-" * 40 + "\n"

    for passenger in booking['passengers']:
        passenger_name = f"{passenger['first_name']} {passenger['last_name']}"
        passenger_gender = passenger.get('gender', 'N/A')  # Default to 'N/A' if gender is not available
        body += f"{passenger_name:<30}{passenger_gender:<10}\n"

    # Check if return trip exists
    if 'return_trip_id' in booking and booking['return_trip_id']:
        body += (
            f"Return Trip:\n"
            f"  Flight Number: {booking['return_trip_id']['flight_id']['flight_number']}\n"
            f"  Airline: {booking['return_trip_id']['flight_id']['airline_id']['name']}\n"
            f"  Departure: {booking['return_trip_id']['departure']} from {booking['return_trip_id']['origin']['name']}\n"
            f"  Arrival: {booking['return_trip_id']['arrival']} at {booking['return_trip_id']['destination']['name']}\n\n"
        )

    # Closing message
    body += (
        "Thank you for booking with us!\n\n"
        "Best regards,\n"
        "Customer Support"
    )

    # Attach the email body to the message
    msg = MIMEMultipart()
    msg['From'] = EMAIL_USER
    msg['To'] = email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    # Send the email
    try:
        with smtplib.SMTP_SSL(EMAIL_SMTP_SERVER, EMAIL_SMTP_PORT) as server:
            server.login(EMAIL_USER, EMAIL_PASSWORD)
            server.send_message(msg)
        print(f"Email sent to {email} with subject: {subject}")
    except Exception as e:
        print(f"Error sending email: {e}")

# Function to fetch booking details from the local API
def get_booking_details(booking_id):
    url = BOOKINGS_API_URL.format(id=booking_id)
    response = requests.get(url)
    if response.status_code == 200:
        booking_data = response.json()
        print("Booking Data:", booking_data)  # Debugging print statement
        return booking_data  # Return the booking data as a JSON object
    else:
        print(f"Error fetching booking details for ID {booking_id}")
        return None

# Function to process jobs from the Redis queue
def process_jobs():
    while True:
        job = client.blpop('flight_bookings', timeout=0)  # Wait for a job
        if job:
            data = job[1]  # Get the job data
            email_data = eval(data)  # Convert string to dictionary

            # Check if the required keys exist
            if 'booking_id' not in email_data or 'email' not in email_data or 'subject' not in email_data:
                print(f"Error: Missing required keys in job data: {email_data}")
                continue

            # Extract booking ID from the job data
            booking_id = email_data['booking_id']
            email = email_data['email']
            subject = email_data['subject']
            
            # Fetch booking details
            booking_data = get_booking_details(booking_id)
            if booking_data:
                # Send the email with the booking data
                send_email(email, subject, booking_data)

if __name__ == "__main__":
    process_jobs()
