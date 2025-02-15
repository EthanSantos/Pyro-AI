"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function Home() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/api/hello")
      .then((response) => {
        setMessage(response.data.message);
      })
      .catch((error) => console.error("Error fetching message:", error));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-4">
        Next.js App Router with Axios, shadcn UI & Flask
      </h1>
      <p className="text-lg mb-4">
        {message ? message : "Loading message from Flask..."}
      </p>
    </div>
  );
}
