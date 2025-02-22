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
import connectDB from "./db";
import User from "@/models/User";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "quickcart-next" });

// Inngest Function to save user data to a database
export const syncUserCreation = inngest.createFunction(
    {
        id: 'sync-user-from-clerk'
    },
    { event: 'clerk/user.created' },

    async ({ event }) => {
        await connectDB();

        const { id, first_name, last_name, email_addresses, image_url } = event.data || {};
        if (!id || !email_addresses || email_addresses.length === 0) {
            console.error("Invalid user data received:", event);
            return;
        }

        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            name: `${first_name || ""} ${last_name || ""}`.trim(),
            imageUrl: image_url || "",
        };

        try {
            await User.create(userData);
        } catch (error) {
            console.error("Error creating user:", error);
        }
    }
);

// Inngest Function to update user data in the database
export const syncUserUpdation = inngest.createFunction(
    {
        id: 'update-user-from-clerk'
    },
    { event: 'clerk/user.updated' },

    async ({ event }) => {
        await connectDB();

        const { id, first_name, last_name, email_addresses, image_url } = event.data || {};
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
            await User.findByIdAndUpdate(id, userData, { new: true });
        } catch (error) {
            console.error("Error updating user:", error);
        }
    }
);

// Inngest Function to delete user from the database
export const syncUserDeletion = inngest.createFunction(
    {
        id: 'delete-user-with-clerk'
    },
    { event: 'clerk/user.deleted' },

    async ({ event }) => {
        await connectDB();

        const { id } = event.data || {};
        if (!id) {
            console.error("Invalid user ID received for deletion:", event);
            return;
        }

        try {
            await User.findByIdAndDelete(id);
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    }
);
