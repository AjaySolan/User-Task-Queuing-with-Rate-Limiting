# Rate-Limited Task API

This API handles tasks with user-specific rate limiting. It supports two rate limits:
- **1 task per second per user**
- **20 tasks per minute per user**

## Setup

1. Ensure Redis is installed and running.
2. Clone the repository and install dependencies:
   ```bash
   npm install
