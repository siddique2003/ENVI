import { hash } from "bcryptjs"
import { NextRequest } from "next/server"

// In a real app, you'd use a database
// This is just for demo purposes - we're using the same users array from [...nextauth]/route.ts
// In a production app, you'd use a proper database
const users = [
  {
    id: "1",
    name: "Test User",
    email: "test@example.com",
    // This is "password123" hashed
    password: "$2a$10$8KVj4kFh9Xb/G9aSIp/mAOTNYMDFZZswyLU1vMmCXjvRzE0xVE5Aq",
    image: null,
  },
]

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    // Validate input
    if (!name || !email || !password) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Check if user already exists
    if (users.some((user) => user.email === email)) {
      return new Response(JSON.stringify({ error: "User already exists" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create new user
    const newUser = {
      id: String(users.length + 1),
      name,
      email,
      password: hashedPassword,
      image: null,
    }

    // Add to users array (in a real app, you'd save to a database)
    users.push(newUser)

    return new Response(
      JSON.stringify({
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
