// import { Inngest } from "inngest";
// import connectDB from "./db";
// import User from "@/models/User";

// // Create a client to send and receive events
// export const inngest = new Inngest({ id: "quickcart-next" });

// //Inngest Function to save user data to a database
// export const syncUserCreation = inngest.createFunction(
//     {
//         id: 'sync-user-from-clerk'
//     },
//     { event: 'clerk/user.created' },

//     async ({ event }) => {
//         const { id, first_name, last_name, email_addresses, image_url } = event.data
//         const userData = {
//             _id: id,
//             email: email_addresses[0].email_address,
//             name: first_name + " " + last_name,
//             imageUrl: image_url
//         }
//         await connectDB()
//         await User.create(userData)
//     }
// )


// //Inngest Function to update user data in database
// export const syncUserUpdation = inngest.createFunction(
//     {
//         id: 'update-user-from-clerk'
//     },
//     { event: 'clerk/user.updated' },
//     async ({ event }) => {
//         const { id, first_name, last_name, email_addresses, image_url } = event.data
//         const userData = {
//             _id: id,
//             email: email_addresses[0].email_address,
//             name: first_name + " " + last_name,
//             imageUrl: image_url
//         }
//         await connectDB()
//         await User.findByIdAndUpdate(id, userData)
//     }
// )

// //Inngest Function to delete user for the Database
// export const syncUserDeletion = inngest.createFunction(
//     {
//         id:'delete-user-with-clerk'
//     },
//     {event:'clerk/user.deleted'},
//     async ({event})=>{
//         const {id} = event.data

//         await connectDB()
//         await User.findByIdAndDelete(id)
//     }
// )


import { Inngest } from "inngest";
import mongoose from "mongoose";
import connectDB from "./db";
import User from "@/models/User";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "quickcart-next" });

// Ensure database connection before any operations
async function ensureDBConnection() {
    if (mongoose.connection.readyState === 0) {
        await connectDB();
    }
}

// Function to create a user in the database
export const syncUserCreation = inngest.createFunction(
    {
        id: "sync-user-from-clerk",
    },
    { event: "clerk/user.created" },

    async ({ event }) => {
        await ensureDBConnection(); // Ensure DB is connected

        const { id, first_name, last_name, email_addresses, image_url } = event?.data || {};
        
        if (!id || !email_addresses?.length) {
            console.error("Invalid user data received:", event);
            return;
        }

        const userData = {
            _id: id, // Make sure MongoDB can accept this as an _id
            email: email_addresses[0].email_address,
            name: `${first_name || ""} ${last_name || ""}`.trim(),
            imageUrl: image_url || "",
        };

        try {
            const existingUser = await User.findById(id);
            if (!existingUser) {
                await User.create(userData);
                console.log("User created successfully:", userData);
            } else {
                console.log("User already exists:", existingUser);
            }
        } catch (error) {
            console.error("Error creating user:", error);
        }
    }
);

// Function to update a user in the database
export const syncUserUpdation = inngest.createFunction(
    {
        id: "update-user-from-clerk",
    },
    { event: "clerk/user.updated" },

    async ({ event }) => {
        await ensureDBConnection(); // Ensure DB is connected

        const { id, first_name, last_name, email_addresses, image_url } = event?.data || {};
        if (!id) {
            console.error("Invalid user ID received:", event);
            return;
        }

        const userData = {
            email: email_addresses?.[0]?.email_address || "",
            name: `${first_name || ""} ${last_name || ""}`.trim(),
            imageUrl: image_url || "",
        };

        try {
            const updatedUser = await User.findByIdAndUpdate(id, userData, { new: true, upsert: true });
            console.log("User updated successfully:", updatedUser);
        } catch (error) {
            console.error("Error updating user:", error);
        }
    }
);

// Function to delete a user from the database
export const syncUserDeletion = inngest.createFunction(
    {
        id: "delete-user-with-clerk",
    },
    { event: "clerk/user.deleted" },

    async ({ event }) => {
        await ensureDBConnection(); // Ensure DB is connected

        const { id } = event?.data || {};
        if (!id) {
            console.error("Invalid user ID received for deletion:", event);
            return;
        }

        try {
            const deletedUser = await User.findByIdAndDelete(id);
            if (deletedUser) {
                console.log("User deleted successfully:", deletedUser);
            } else {
                console.log("User not found for deletion:", id);
            }
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    }
);
