# BanBDS

This is the mobile app for the [BanBds](https://github.com/agneskrivers/BanBds) project, a platform for buying and selling real estate properties in Vietnam.

## Demo

![Demo BanBds](https://j.gifs.com/NO60Yp.gif 'App BanBds')

## Features

This web application has the following features:

-   User authentication and authorization
-   Ability to post new property listings
-   Search for properties by location, price, and other criteria
-   View detailed information about individual properties
-   Contact the seller of a property through the website

## Setup

To get started with this app, you will need to have Node.js and npm installed on your machine. Once you have those installed, you can follow these steps:

1. Clone the repository:

```bash
git clone https://github.com/agneskrivers/App-BanBDS.git
cd App-BanBDS
```

2. Install the dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory of the project to store your environment variables. Here are the variables you will need to define:

-   `GOOGLE_API_KEY`: The API key for Google Map, a service of google maps
-   `LIMIT_RENEW`: Limit the number of times the user verification code is sent
-   `LIMIT_FAILED`: Limit the number of times you enter the wrong confirmation code
-   `NUMBER_REPEAT_UPDATE`: Device information update time. Calculated in days
-   `WEBSITE_NAME_DEFAULT`: Default site name
-   `LINK_DEFAULT`: Default site link
-   `API_URI`: The base URL for the API that the app will use to fetch data.

    You can copy the contents of the `.env` file and fill in the necessary values for each variable.

    `Note`: that the app can only use the API provided by the [BanBds project](https://github.com/agneskrivers/BanBds).

```javascript
    LIMIT_RENEW=3
    LIMIT_FAILED=5
    NUMBER_REPEAT_UPDATE=10
    WEBSITE_NAME_DEFAULT=BanBds
    LINK_DEFAULT=https://banbds.claimether.com
    API_URI=https://banbds.claimether.com
```

4. Start the development server:

```bash
npx react-native start
```

5. Run the app in a simulator or on a device:

```bash
npx react-native run-ios # Run IOS Simulator
# or
npx react-native run-android # Run Android Emulator
```

## Contributing

Contributions to this project are welcome. If you find a bug or have an idea for a new feature, please open an issue or a pull request.

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
