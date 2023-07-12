<a name="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
     <a href="https://elektorai.pl/">
    <img src="https://github.com/marcinmosiejko/elektor-ai/blob/main/public/favicon.png" alt="Logo" width="64" height="64">
  </a>

<h3 align="center">Elektor AI</h3>

  <p align="center">
    AI Voting Assistant
    <br />
    <br />
    <a href="https://elektorai.pl/">View</a>
  </p>
</div>

<br />
<br />

<!-- FEATURES -->

## Features

### User

- Ask questions to selected party's election program
- Streamed answers using ChatGPT 3.5
- Themes

### Management

- Backoffice with admin access only (auth using github) that allows for
  - parse pdf files and CRUD source documents
  - CRUD cached answers

### Optimizations

- Rate limiting based on user's IP
- Caching already asked questions

<br />

<!-- SCREENSHOTS -->

<!-- ## Video

<br />
<img src="https://github.com/mosiej803/trakker-app/blob/main/src/assets/img/screenshots/screenshot_1.png" alt="desktop usage 1" />
<img src="https://github.com/mosiej803/trakker-app/blob/main/src/assets/img/screenshots/screenshot_2.png" alt="desktop usage 2" />
<img src="https://github.com/mosiej803/trakker-app/blob/main/src/assets/img/screenshots/screenshot_3.png" alt="desktop usage 3" />
<img src="https://github.com/mosiej803/trakker-app/blob/main/src/assets/img/screenshots/screenshot_4.png" alt="desktop usage 4" /> -->

<p align="right">(<a href="#readme-top">back to top</a>)</p>
<br />

<!-- BUILT WITH -->

## Built With

[![TS][Typescript]][Typescript-url]
[![Qwik][Qwik.js]][Qwik-url]
[![Node][Node]][Node-url]
[![Tailwind][Tailwind]][Tailwind-url]
[![ChatGPT][ChatGPT]][ChatGPT-url]
[![MongoDB][MongoDB]][MongoDB-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>
<br />

<!-- RUN LOCALLY -->

## Run The App Locally

1. Clone the repo
   ```sh
   git clone https://github.com/marcin_mosiejko/elektor-ai
   ```
2. Rename `.env.example` to `.env.local` file and provide:

- your Github email address that will be used for admin verification (for backoffice access)
- [Github Auth](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app) credentials
- [Pinecone](https://www.pinecone.io/) credentials
- [MongoDB](https://mongodb.com/) url (run locally or in cloud)

3. Install NPM packages
   ```sh
   npm install
   ```
4. Run
   ```sh
   npm run dev
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>
<br />

<!-- CONTACT -->

## Contact

LinkedIn - [Marcin Mosiejko](https://www.linkedin.com/in/marcin-mosiejko-45937051/)

Twitter - [@marcin_mosiejko](https://twitter.com/marcin_mosiejko)

Project Link - [https://github.com/marcinmosiejko/elektor-ai](https://github.com/marcinmosiejko/elektor-ai)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LINKS -->

[Typescript]: https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
[Typescript-url]: https://www.typescriptlang.org/
[Qwik.js]: https://img.shields.io/badge/Qwik-8A2BE2?style=for-the-badge
[Qwik-url]: https://qwik.builder.io/
[Tailwind]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[Tailwind-url]: https://tailwindcss.com/
[Node]: https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white
[Node-url]: https://nodejs.org/
[ChatGPT]: https://img.shields.io/badge/chatGPT-74aa9c?style=for-the-badge&logo=openai&logoColor=white
[ChatGPT-url]: https://chat.openai.com
[MongoDB]: https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white
[MongoDB-url]: https://mongodb.com/
