# Poster Web

Poster Web is a social media web application designed to offer a fresh take on sharing content and community engagement. The platform prioritises user control, and a clean, ad-free experience.

## Features

- **Real-time Chat**: Seamless messaging with live updates.
- **User Profiles**: Customisable profiles with post histories, favourite artists, and listening history thanks to [Spotify](https://developer.spotify.com/documentation/web-api) integration.
- **Notifications**: Instant alerts for new messages and follow events.
- **Home Feed**: A dynamic feed showcasing posts from friends and new users.
- **Responsive Design**: Optimised for both web and mobile platforms.

## Setup

The quickest way to set the project up is to use the `setup.sh` script which can be found [here](https://gist.github.com/ryan0x41/d5b6ef8c2331c92a42d69593fed9cd4b). Once executed, this will clone the `poster-web` repository along with the `poster-api-wrapper` submodule.

It will then give you the following option

```bash
Do you wish to connect to a local API configuration? (y/n):
```

Assuming that https://api.poster-social.com is live, selecting no will simply default to this url as the backend API. If yes is selected you will need to run an instance of Poster API locally.

Once completed the script will setup a `.config` and automatically run Poster Web at `http://localhost:4000`

## Manual Configuration

To connect to a hosted version of the Poster API, you must create a `.config` file in the project root. This file should define the following variables:

```ini
WEBURL="https://api.poster-social.com"
WSPORTNUMBER="443"
```

These settings allow the application to interact with the latest hosted version of the Poster API.

## Dependencies

- **Poster API** : The main API powering the backend services. For more details, visit the [Poster API repository](https://github.com/ryan0x41/poster-api) .
- **Poster API Wrapper** : A JavaScript wrapper available in the `lib` folder that simplifies interactions with the Poster API. Check it out [here](https://github.com/ryan0x41/poster-web-api-wrapper) .
- **Node** : Along with everything inside of `package.json`.

> **Note** : The documentation for the Poster API is available [here](https://github.com/ryan0x41/poster-api/wiki/Poster-API-Documentation) but please note it is about 4 weeks outdated as of 20 March 2025.

## Hosted Version

The latest hosted version of the Poster API is available at [https://api.poster-social.com](https://api.poster-social.com/) . Use the above configuration settings to connect your project to this service.

## Contributions

Pull requests are welcome! The project is actively maintained by:

- [igaaxwal](https://github.com/igaaxwal)
- [SeanByr](https://github.com/SeanByr)
- [ryan0x41](https://github.com/ryan0x41) / [ryan-sheridan](https://github.com/ryan-sheridan)

Feel free to contribute improvements, report issues, or suggest new features. 