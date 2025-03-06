# droneDelivery
*Setup Instructions*


*Backend Setup*

Clone the Repository:

Copy

git clone https://github.com/ShamaanAvi/droneProject

cd (repository-directory)


Install Dependencies:

Copy

npm install


Configure Environment Variables:

Create or update the config.json file with your MongoDB connection string:

Copy

{

  "MONGO_URI": "your-mongodb-connection-string"
  
}

Alternatively, you can use a .env file and use the serverless-dotenv-plugin to load environment variables.


Run Locally with Serverless Offline:

Copy

npx serverless offline

This command starts your backend APIs locally (typically on http://localhost:3000/dev).


*Frontend Setup*


Navigate to the Frontend Directory

Copy

cd drone-dashboard

Install Dependencies:

Copy

npm install

Run the Frontend Application:

Copy

npm run dev

This starts the React development server (commonly on http://localhost:5173).


*Running the Application*

Backend:

Ensure your MongoDB instance is running and accessible.

Start the backend using "serverless offline" to simulate AWS Lambda locally.

Test endpoints using Powershell Invoke-WebRequest commands.

Frontend:

With the backend running, start the React development server.

Open http://localhost:5173 in your browser to view the dashboard.
