/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new flight booking
 *     tags:
 *       - Bookings
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               trip_id:
 *                 type: integer
 *               return_trip_id:
 *                 type: integer
 *               status:
 *                 type: string
 *                 default: confirmed
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: float
 *               payment_mode:
 *                 type: string
 *               passengers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     gender:
 *                       type: string
 *                     dateOfBirth:
 *                       type: string
 *                       format: date
 *               no_of_passengers:
 *                 type: integer
 *               booking_type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 newBooking:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *       400:
 *         description: Required fields are missing
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get all bookings for the authenticated user
 *     tags:
 *       - Bookings
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bookings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       status:
 *                         type: string
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /bookings/{bookingId}/cancel:
 *   patch:
 *     summary: Cancel a specific booking
 *     tags:
 *       - Bookings
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         description: The ID of the booking to cancel
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 booking:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     status:
 *                       type: string
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /bookings/{booking_id}:
 *   get:
 *     summary: Get a specific booking by ID
 *     tags:
 *       - Bookings
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: booking_id
 *         required: true
 *         description: The ID of the booking
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Details of the booking
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 booking:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     trip_id:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                     status:
 *                       type: string
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal Server Error
 */
