# “2gather”: A Large Group Meeting Assistant

## Introduction
The global COVID-19 pandemic has dramatically increased the number of people working remotely. Employee surveys1 show that a large proportion of the workforce would desire to retain the flexibility of “working from anywhere” at least partially upon the reopening of the offices. Virtual meetings are an integral part of remote collaboration. In the absence of face-to-face communication, it can be tedious to accommodate all the participants while scheduling these gatherings. Moreover, the meeting organizer has to first solicit access to all their calendars before being able to find the available slots. This becomes cumbersome as the number of callers surpasses just a few people. Additionally, the participants often report large group meetings as inefficient use of their time due to the lack of focus. We are aiming to address these three issues.

## Problem Statement and Approach
We have created an initial version of a Meeting Assistant that takes care of the meeting organization among a potentially large group of participants. It will negotiate the best time for everyone, or as many people as possible, by intersecting their free time slots and letting them vote for the most suitable one if desired. It has a bidirectional integration with Google Calendar, being able to retrieve availability information as well as automatically create the respective events; the Google account is also used for single sign-on (SSO) authorization to streamline the adoption. Moreover, the tool provides a convenient way of adding questions and voting for them before the session starts, which helps the meeting organizer to set the agenda and lets the members prepare in advance.
The user interface is presented in the form of a web application. Sample screens can be found below:
<img width="843" alt="Screen Shot 2022-05-23 at 9 14 50 PM" src="https://user-images.githubusercontent.com/15210801/169947680-31a9b730-0ef3-451b-829f-1d0a4af6776a.png">
<img width="843" alt="Screen Shot 2022-05-23 at 9 15 05 PM" src="https://user-images.githubusercontent.com/15210801/169947734-0fa275d1-8e27-4334-bb2f-0468de9b1e8b.png">
<img width="844" alt="Screen Shot 2022-05-23 at 9 15 19 PM" src="https://user-images.githubusercontent.com/15210801/169947755-06ecf2ed-3c51-4c02-9bdc-e4b87abeba49.png">

The final live experience is showcased in the [demonstrational video](https://www.youtube.com/watch?v=y_6fxoH2XHs&ab_channel=HannaKartynnik).

##  Architecture and APIs
The back-end is implemented as a serverless Amazon Web Services cloud deployment. The architecture details are outlined in the following schemas.
<img width="691" alt="Screen Shot 2022-05-23 at 9 18 47 PM" src="https://user-images.githubusercontent.com/15210801/169948105-8aef8ce0-be95-41e1-9bc1-c0ac0ae5e499.png">
### Relational Database Scheme (PostgreSQL)
<img width="1015" alt="Screen Shot 2022-05-23 at 9 21 32 PM" src="https://user-images.githubusercontent.com/15210801/169948298-d7e8174e-e5f3-4222-abac-b41ac45bf926.png">

## Design details and Code Structure

### Design details
The authentication is conducted using the Google OAuth 2.0 API (thus leveraging the single sign-on functionality). Upon the first encounter, the user has to select the permissions they give to the application (we rely on the ability to access their “busy” calendar slots). We use the token received from the Google API to initialize the Amazon Cognito client SDK.
All the endpoints require AWS IAM authorization which implies that the client uses Signature Version 4 to sign its requests with AWS credentials. Additionally, the Cognito identity pool is configured to give the authenticated users a role that has the execute-api permission for the API gateway.
Most endpoints are implemented as integrations using the corresponding Lambda functions. There are two Lambda functions that process messages from two Amazon message queues. The first queue aggregates the meetings that wait for the time slot suggestions. The other queue is used for the confirmed meetings: the processing Lambda automatically creates an event in all the participants’ Google calendars and sends the emails with the information about the meetings for participants who have not shared their calendars with the application. Yet another Lambda function tracks the status of the meeting proposals for auto-acceptance conditions where applicable (“a certain timeout has passed since all the users have voted”).
The data model is rather straightforward. Given the amount of interrelated queries and the modest amount of entities to handle (limited by the physical constraints on the number of meetings a single person can have per week), a relational database schema was chosen. One of the reasons to choose PostgreSQL in particular was the inbuilt support for time zone-bearing timestamps (TIMESTAMPTZ). The file attachments are stored in Amazon S3.
The web front-end is built using the ReactJS framework. The back-end Lambda functions are implemented with a NodeJS runtime.

### Code Structure
The code has been organized in two directories: `backend` and `frontend`. The notable subfolders of the `backend` folder are `db` and `lambda`. The `db` folder contains the migration files for creating all the required database tables. It also has a small NodeJS script `run_migrations.js` to run the migration files on top of the selected database instance. The `lambda` folder consists of several folders, one for each Lambda function used in the project. The files specific to a given lambda function are located in the corresponding directory; the files used by several lambda functions are located in the root of the `lambda` directory. I have also created a shell script `deploy.sh` for deploying (creating/updating) the lambda functions from the local machine on AWS.
The `frontend` folder has a structure common to most ReactJS web applications. It has the `components` folder with all the React components used in the project. The `images` directory consists of the used icons, the `hooks` folder consists of the React hook components (utility helpers). The `services` directory contains the code that interacts with the backend gateway API as well as the Google user profile API.
