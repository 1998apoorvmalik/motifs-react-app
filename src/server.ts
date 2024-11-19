// src/server.ts
import path from "path";
import express, { Request, Response } from "express";
import cors from "cors";
import axios from 'axios';

const app = express();
// const { createProxyMiddleware } = require("http-proxy-middleware");

const SERVER_URL = "127.0.0.1"
const PORT = 8082;

const API_URL = process.env.NODE_ENV === "production" ?
    "http://10.217.112.20:5000" : "http://10.217.112.20:5000";

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app build directory
app.use("/motifs", express.static(path.join(__dirname, "../../motifs-react-app/build")));

// // Proxy requests to Flask (root `/`)
// app.use(
//     "/",
//     createProxyMiddleware({
//       target: "http://127.0.0.1:8081", // Flask app running on this port
//       changeOrigin: true,
//     })
//   );

// Routes
app.get("/hello", (req: Request, res: Response) => {
    res.json({ message: "Hello from Motifs Frontend Server!" });
});


app.get("/motifs/api/total", async (req: Request, res: Response) => {
    try {
        console.log("[INFO] Fetching total motifs count from the API");
        const response = await axios.get(API_URL + "/total");
        res.status(response.status).json(response.data);
    } catch (error) {
        const errorMessage = (error as any).message;
        console.error("Error fetching total count from the API:", errorMessage);
        res.status(500).json({ error: "Failed to fetch total count from the API" });
    }
});


app.get("/motifs/api/motif", async (req: Request, res: Response) => {
    try {
        console.log("[INFO] Fetching motif from the API");
        const response = await axios.get(API_URL + "/api/motif", { params: req.query });
        res.status(response.status).json(response.data);
    } catch (error) {
        const errorMessage = (error as any).message;
        console.error("Error fetching motif from the API:", errorMessage);
        res.status(500).json({ error: "Failed to fetch motif from the API" });
    }
});


app.get("/motifs/api/motifs", async (req: Request, res: Response) => {
    try {
        console.log("[INFO] Fetching motifs from the API");
        const response = await axios.get(API_URL + "/api/motifs", { params: req.query });
        res.status(response.status).json(response.data);
    } catch (error) {
        const errorMessage = (error as any).message;
        console.error("Error fetching motifs from the API:", errorMessage);
        res.status(500).json({ error: "Failed to fetch motifs from the API" });
    }
});


app.get("/motifs/api/structure", async (req: Request, res: Response) => {
    try {
        console.log("[INFO] Fetching structure from the API");
        const response = await axios.get(API_URL + "/api/structure", { params: req.query });
        res.status(response.status).json(response.data);
    } catch (error) {
        const errorMessage = (error as any).message;
        console.error("Error fetching structure from the API:", errorMessage);
        res.status(500).json({ error: "Failed to fetch structure from the API" });
    }
});


app.post('/motifs/api/new', async (req: Request, res: Response) => {
    try {
        console.log('[INFO] Forwarding streaming request to backend server');

        // Forward the request to the backend server with streaming enabled
        const backendResponse = await axios.post(API_URL + '/api/new', req.body, {
            responseType: 'stream',
            decompress: false, // Ensure data is streamed directly
        });

        // Set streaming headers for the client
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no'); 
        res.flushHeaders(); // Flush headers immediately to start the stream

        // Pipe the backend stream directly to the client
        backendResponse.data.on('data', (chunk: Buffer) => {
            res.write(chunk); // Write the data chunk immediately
        });

        backendResponse.data.on('end', () => {
            console.log('[INFO] Backend stream ended');
            res.end(); // End the response when backend finishes streaming
        });

        backendResponse.data.on('error', (error: Error) => {
            console.error('[ERROR] Backend stream error:', error.message);
            res.status(500).json({ error: 'Streaming error from backend' });
        });
    } catch (error: unknown) {
        console.error('[ERROR] Request to backend server failed');

        // Handle Axios-specific errors
        if (axios.isAxiosError(error)) {
            if (error.response) {
                // Backend responded with an error status code
                console.error('[ERROR] Backend error:', error.response.statusText);
                res.status(error.response.status).json({ error: error.response.statusText });
            } else if (error.request) {
                // No response received from the backend
                console.error('[ERROR] No response from backend server:', error.message);
                res.status(500).json({ error: 'No response from backend server' });
            } else {
                // Other Axios-specific errors
                console.error('[ERROR] Axios error:', error.message);
                res.status(500).json({ error: 'Error communicating with backend server' });
            }
        } else {
            // Handle non-Axios errors
            console.error('[ERROR] Unexpected error:', (error as Error).message);
            res.status(500).json({ error: 'Unexpected server error' });
        }
    }
});


// React fallback route for client-side routing
app.get("*", (_: Request, res: Response) => {
    res.sendFile(
        path.join(__dirname, "../../motifs-react-app/build", "index.html")
    );
});


// Start server
app.listen(PORT, () => {
    console.log(`Server is running on ${SERVER_URL}:${PORT}`);
});
