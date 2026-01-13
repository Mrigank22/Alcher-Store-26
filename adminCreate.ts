import { getPayload } from 'payload'
import config from './payload.config' // Adjust path to your actual config file

const createAdmin = async () => {
    try {
        // Get a local copy of Payload by passing your config
        const payload = await getPayload({ config })

        const adminEmail = 'p.mrigank22@gmail.com'

        // Check if user already exists
        const existingUsers = await payload.find({
            collection: 'users',
            where: {
                email: {
                    equals: adminEmail
                }
            }
        })

        if (existingUsers.docs.length > 0) {
            console.log(`Admin user with email ${adminEmail} already exists. Skipping creation.`)
            process.exit(0)
        }

        // Create the admin user if it doesn't exist
        const user = await payload.create({
            collection: 'users',
            data: {
                email: adminEmail,
                password: 'chickenbiryani@22',
                name: 'Admin User', // Optional: Add a name
                role: 'admin' // This matches your Users collection config
            }
        })

        console.log('Admin user created successfully:', user.email)
        process.exit(0)
    } catch (error) {
        console.error('Error creating admin user:', error)
        process.exit(1)
    }
}

createAdmin()