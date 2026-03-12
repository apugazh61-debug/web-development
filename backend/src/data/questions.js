const questions = [
  {
    "id": 1,
    "section": "Web Development",
    "question": "What does HTML stand for?",
    "options": [
      "Hyper Text Markup Language",
      "High Text Machine Language",
      "Hyper Tabular Markup Language",
      "Hyper Tool Multi Language"
    ],
    "correctAnswer": 0
  },
  {
    "id": 2,
    "section": "Web Development",
    "question": "Which HTML tag is used to create a hyperlink?",
    "options": [
      "<link>",
      "<a>",
      "<href>",
      "<url>"
    ],
    "correctAnswer": 1
  },
  {
    "id": 3,
    "section": "Web Development",
    "question": "Which language is used for styling web pages?",
    "options": [
      "HTML",
      "CSS",
      "Python",
      "SQL"
    ],
    "correctAnswer": 1
  },
  {
    "id": 4,
    "section": "Web Development",
    "question": "Which HTML tag is used to display an image?",
    "options": [
      "<img>",
      "<picture>",
      "<src>",
      "<image>"
    ],
    "correctAnswer": 0
  },
  {
    "id": 5,
    "section": "Web Development",
    "question": "Which property is used to change text color in CSS?",
    "options": [
      "font-color",
      "text-color",
      "color",
      "background-color"
    ],
    "correctAnswer": 2
  },
  {
    "id": 6,
    "section": "Web Development",
    "question": "Which HTML tag is used for the largest heading?",
    "options": [
      "<h6>",
      "<h1>",
      "<heading>",
      "<head>"
    ],
    "correctAnswer": 1
  },
  {
    "id": 7,
    "section": "Web Development",
    "question": "Which CSS property controls text size?",
    "options": [
      "text-style",
      "font-size",
      "text-size",
      "font-style"
    ],
    "correctAnswer": 1
  },
  {
    "id": 8,
    "section": "Web Development",
    "question": "JavaScript is mainly used for?",
    "options": [
      "Database management",
      "Styling web pages",
      "Adding interactivity to web pages",
      "Server hosting"
    ],
    "correctAnswer": 2
  },
  {
    "id": 9,
    "section": "Web Development",
    "question": "Which HTML tag is used to create a table row?",
    "options": [
      "<td>",
      "<tr>",
      "<th>",
      "<row>"
    ],
    "correctAnswer": 1
  },
  {
    "id": 10,
    "section": "Web Development",
    "question": "Which tag is used for inserting a line break?",
    "options": [
      "<break>",
      "<br>",
      "<lb>",
      "<line>"
    ],
    "correctAnswer": 1
  },
  {
    "id": 11,
    "section": "Web Development",
    "question": "Which CSS property is used to change background color?",
    "options": [
      "bgcolor",
      "background",
      "background-color",
      "color-background"
    ],
    "correctAnswer": 2
  },
  {
    "id": 12,
    "section": "Web Development",
    "question": "Which HTML element is used for an unordered list?",
    "options": [
      "<ol>",
      "<ul>",
      "<li>",
      "<list>"
    ],
    "correctAnswer": 1
  },
  {
    "id": 13,
    "section": "Web Development",
    "question": "Which tag is used to create a list item?",
    "options": [
      "<li>",
      "<ul>",
      "<item>",
      "<list>"
    ],
    "correctAnswer": 0
  },
  {
    "id": 14,
    "section": "Web Development",
    "question": "Which attribute is used to specify an image source?",
    "options": [
      "link",
      "src",
      "href",
      "alt"
    ],
    "correctAnswer": 1
  },
  {
    "id": 15,
    "section": "Web Development",
    "question": "Which HTML tag is used for inserting a video?",
    "options": [
      "<media>",
      "<video>",
      "<movie>",
      "<play>"
    ],
    "correctAnswer": 1
  },
  {
    "id": 16,
    "section": "Web Development",
    "question": "Which symbol is used for ID selector in CSS?",
    "options": [
      ".",
      "#",
      "*",
      "&"
    ],
    "correctAnswer": 1
  },
  {
    "id": 17,
    "section": "Web Development",
    "question": "Which symbol is used for class selector in CSS?",
    "options": [
      "#",
      ".",
      "*",
      "$"
    ],
    "correctAnswer": 1
  },
  {
    "id": 18,
    "section": "Web Development",
    "question": "Which method is used to select an element by ID in JavaScript?",
    "options": [
      "getElement()",
      "getElementById()",
      "selectById()",
      "queryId()"
    ],
    "correctAnswer": 1
  },
  {
    "id": 19,
    "section": "Web Development",
    "question": "Which HTML tag is used to create a form?",
    "options": [
      "<input>",
      "<form>",
      "<submit>",
      "<data>"
    ],
    "correctAnswer": 1
  },
  {
    "id": 20,
    "section": "Web Development",
    "question": "Which input type is used for passwords?",
    "options": [
      "text",
      "password",
      "pass",
      "secure"
    ],
    "correctAnswer": 1
  },
  {
    "id": 21,
    "section": "Web Development",
    "question": "Which HTTP method is used to send data securely?",
    "options": [
      "GET",
      "POST",
      "FETCH",
      "SEND"
    ],
    "correctAnswer": 1
  },
  {
    "id": 22,
    "section": "Web Development",
    "question": "Which language runs on the server side?",
    "options": [
      "HTML",
      "CSS",
      "PHP",
      "XML"
    ],
    "correctAnswer": 2
  },
  {
    "id": 23,
    "section": "Web Development",
    "question": "Which HTML tag defines the document title?",
    "options": [
      "<title>",
      "<meta>",
      "<head>",
      "<header>"
    ],
    "correctAnswer": 0
  },
  {
    "id": 24,
    "section": "Web Development",
    "question": "Which tag is used for JavaScript code?",
    "options": [
      "<javascript>",
      "<script>",
      "<js>",
      "<code>"
    ],
    "correctAnswer": 1
  },
  {
    "id": 25,
    "section": "Web Development",
    "question": "Which CSS property is used to make text bold?",
    "options": [
      "text-bold",
      "font-weight",
      "text-style",
      "bold"
    ],
    "correctAnswer": 1
  },
  {
    "id": 26,
    "section": "Web Development",
    "question": "Which HTML element defines navigation links?",
    "options": [
      "<menu>",
      "<nav>",
      "<link>",
      "<navigate>"
    ],
    "correctAnswer": 1
  },
  {
    "id": 27,
    "section": "Web Development",
    "question": "Which HTML tag is used to create a button?",
    "options": [
      "<btn>",
      "<button>",
      "<click>",
      "<press>"
    ],
    "correctAnswer": 1
  },
  {
    "id": 28,
    "section": "Web Development",
    "question": "Which property is used for spacing inside elements?",
    "options": [
      "margin",
      "padding",
      "border",
      "space"
    ],
    "correctAnswer": 1
  },
  {
    "id": 29,
    "section": "Web Development",
    "question": "Which property controls space outside elements?",
    "options": [
      "margin",
      "padding",
      "border",
      "gap"
    ],
    "correctAnswer": 0
  },
  {
    "id": 30,
    "section": "Web Development",
    "question": "Which HTML tag is used to define a paragraph?",
    "options": [
      "<para>",
      "<p>",
      "<text>",
      "<pg>"
    ],
    "correctAnswer": 1
  },
  {
    "id": 31,
    "section": "Web Development",
    "question": "Which database is commonly used in web applications?",
    "options": [
      "MySQL",
      "Photoshop",
      "Illustrator",
      "Blender"
    ],
    "correctAnswer": 0
  },
  {
    "id": 32,
    "section": "Web Development",
    "question": "Which protocol is used for secure websites?",
    "options": [
      "HTTP",
      "HTTPS",
      "FTP",
      "SMTP"
    ],
    "correctAnswer": 1
  },
  {
    "id": 33,
    "section": "Web Development",
    "question": "Which HTML tag defines the footer section?",
    "options": [
      "<bottom>",
      "<footer>",
      "<end>",
      "<section>"
    ],
    "correctAnswer": 1
  },
  {
    "id": 34,
    "section": "Web Development",
    "question": "Which tag defines a section in HTML5?",
    "options": [
      "<div>",
      "<section>",
      "<part>",
      "<content>"
    ],
    "correctAnswer": 1
  },
  {
    "id": 35,
    "section": "Web Development",
    "question": "Which CSS property is used to center text?",
    "options": [
      "text-align",
      "align-text",
      "text-position",
      "center-text"
    ],
    "correctAnswer": 0
  },
  {
    "id": 36,
    "section": "Web Development",
    "question": "Which JavaScript keyword declares a variable?",
    "options": [
      "int",
      "var",
      "define",
      "create"
    ],
    "correctAnswer": 1
  },
  {
    "id": 37,
    "section": "Web Development",
    "question": "Which tag is used for inserting audio?",
    "options": [
      "<sound>",
      "<audio>",
      "<music>",
      "<mp3>"
    ],
    "correctAnswer": 1
  },
  {
    "id": 38,
    "section": "Web Development",
    "question": "Which attribute opens a link in a new tab?",
    "options": [
      "new",
      "open",
      "target=\"_blank\"",
      "link-new"
    ],
    "correctAnswer": 2
  },
  {
    "id": 39,
    "section": "Web Development",
    "question": "Which CSS property changes font type?",
    "options": [
      "font-family",
      "font-style",
      "font-name",
      "text-font"
    ],
    "correctAnswer": 0
  },
  {
    "id": 40,
    "section": "Web Development",
    "question": "Which JavaScript function shows a popup message?",
    "options": [
      "msg()",
      "popup()",
      "alert()",
      "show()"
    ],
    "correctAnswer": 2
  }
];

module.exports = questions;