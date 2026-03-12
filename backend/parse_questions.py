import re
import json

raw_text = """
1. What does HTML stand for?
A) Hyper Text Markup Language
B) High Text Machine Language
C) Hyper Tabular Markup Language
D) Hyper Tool Multi Language
Correct Answer: A) Hyper Text Markup Language
2. Which HTML tag is used to create a hyperlink?
A) <link>
B) <a>
C) <href>
D) <url>
Correct Answer: B) <a>
3. Which language is used for styling web pages?
A) HTML
B) CSS
C) Python
D) SQL
Correct Answer: B) CSS
4. Which HTML tag is used to display an image?
A) <img>
B) <picture>
C) <src>
D) <image>
Correct Answer: A) <img>
5. Which property is used to change text color in CSS?
A) font-color
B) text-color
C) color
D) background-color
Correct Answer: C) color
6. Which HTML tag is used for the largest heading?
A) <h6>
B) <h1>
C) <heading>
D) <head>
Correct Answer: B) <h1>
7. Which CSS property controls text size?
A) text-style
B) font-size
C) text-size
D) font-style
Correct Answer: B) font-size
8. JavaScript is mainly used for?
A) Database management
B) Styling web pages
C) Adding interactivity to web pages
D) Server hosting
Correct Answer: C) Adding interactivity to web pages
9. Which HTML tag is used to create a table row?
A) <td>
B) <tr>
C) <th>
D) <row>
Correct Answer: B) <tr>
10. Which tag is used for inserting a line break?
A) <break>
B) <br>
C) <lb>
D) <line>
Correct Answer: B) <br>
11. Which CSS property is used to change background color?
A) bgcolor
B) background
C) background-color
D) color-background
Correct Answer: C) background-color
12. Which HTML element is used for an unordered list?
A) <ol>
B) <ul>
C) <li>
D) <list>
Correct Answer: B) <ul>
13. Which tag is used to create a list item?
A) <li>
B) <ul>
C) <item>
D) <list>
Correct Answer: A) <li>
14. Which attribute is used to specify an image source?
A) link
B) src
C) href
D) alt
Correct Answer: B) src
15. Which HTML tag is used for inserting a video?
A) <media>
B) <video>
C) <movie>
D) <play>
Correct Answer: B) <video>
16. Which symbol is used for ID selector in CSS?
A) .
B) #
C) *
D) &
Correct Answer: B) #
17. Which symbol is used for class selector in CSS?
A) #
B) .
C) *
D) $
Correct Answer: B) .
18. Which method is used to select an element by ID in JavaScript?
A) getElement()
B) getElementById()
C) selectById()
D) queryId()
Correct Answer: B) getElementById()
19. Which HTML tag is used to create a form?
A) <input>
B) <form>
C) <submit>
D) <data>
Correct Answer: B) <form>
20. Which input type is used for passwords?
A) text
B) password
C) pass
D) secure
Correct Answer: B) password
21. Which HTTP method is used to send data securely?
A) GET
B) POST
C) FETCH
D) SEND
Correct Answer: B) POST
22. Which language runs on the server side?
A) HTML
B) CSS
C) PHP
D) XML
Correct Answer: C) PHP
23. Which HTML tag defines the document title?
A) <title>
B) <meta>
C) <head>
D) <header>
Correct Answer: A) <title>
24. Which tag is used for JavaScript code?
A) <javascript>
B) <script>
C) <js>
D) <code>
Correct Answer: B) <script>
25. Which CSS property is used to make text bold?
A) text-bold
B) font-weight
C) text-style
D) bold
Correct Answer: B) font-weight
26. Which HTML element defines navigation links?
A) <menu>
B) <nav>
C) <link>
D) <navigate>
Correct Answer: B) <nav>
27. Which HTML tag is used to create a button?
A) <btn>
B) <button>
C) <click>
D) <press>
Correct Answer: B) <button>
28. Which property is used for spacing inside elements?
A) margin
B) padding
C) border
D) space
Correct Answer: B) padding
29. Which property controls space outside elements?
A) margin
B) padding
C) border
D) gap
Correct Answer: A) margin
30. Which HTML tag is used to define a paragraph?
A) <para>
B) <p>
C) <text>
D) <pg>
Correct Answer: B) <p>
31. Which database is commonly used in web applications?
A) MySQL
B) Photoshop
C) Illustrator
D) Blender
Correct Answer: A) MySQL
32. Which protocol is used for secure websites?
A) HTTP
B) HTTPS
C) FTP
D) SMTP
Correct Answer: B) HTTPS
33. Which HTML tag defines the footer section?
A) <bottom>
B) <footer>
C) <end>
D) <section>
Correct Answer: B) <footer>
34. Which tag defines a section in HTML5?
A) <div>
B) <section>
C) <part>
D) <content>
Correct Answer: B) <section>
35. Which CSS property is used to center text?
A) text-align
B) align-text
C) text-position
D) center-text
Correct Answer: A) text-align
36. Which JavaScript keyword declares a variable?
A) int
B) var
C) define
D) create
Correct Answer: B) var
37. Which tag is used for inserting audio?
A) <sound>
B) <audio>
C) <music>
D) <mp3>
Correct Answer: B) <audio>
38. Which attribute opens a link in a new tab?
A) new
B) open
C) target="_blank"
D) link-new
Correct Answer: C) target="_blank"
39. Which CSS property changes font type?
A) font-family
B) font-style
C) font-name
D) text-font
Correct Answer: A) font-family
40. Which JavaScript function shows a popup message?
A) msg()
B) popup()
C) alert()
D) show()
Correct Answer: C) alert()
"""

questions = []
# Split by number followed by dot
parts = re.split(r'\n+(\d+)\.', '\n' + raw_text.strip())
# The first element might be empty or whitespace
for i in range(1, len(parts), 2):
    q_id = int(parts[i])
    content = parts[i+1].strip()
    
    # Split content into lines and filter empty ones
    lines = [L.strip() for L in content.split('\n') if L.strip()]
    if not lines: continue
    
    question_text = lines[0]
    
    options = []
    correct_ans_idx = -1
    
    for line in lines[1:]:
        if line.startswith('A)'):
            options.append(line[2:].strip())
        elif line.startswith('B)'):
            options.append(line[2:].strip())
        elif line.startswith('C)'):
            options.append(line[2:].strip())
        elif line.startswith('D)'):
            options.append(line[2:].strip())
        elif 'Correct Answer:' in line:
            # Extract the letter (A, B, C, or D)
            match = re.search(r'Correct Answer:\s*([A-D])\)', line)
            if match:
                letter = match.group(1)
                correct_ans_idx = ord(letter) - ord('A')

    questions.append({
        "id": q_id,
        "section": "Web Development",
        "question": question_text,
        "options": options,
        "correctAnswer": correct_ans_idx
    })

output = "const questions = " + json.dumps(questions, indent=2) + ";\n\nmodule.exports = questions;"
with open('new_questions_backend.js', 'w', encoding='utf-8') as f:
    f.write(output)

output_frontend = "const questions = " + json.dumps(questions, indent=2) + ";\n\nexport default questions;"
with open('new_questions_frontend.js', 'w', encoding='utf-8') as f:
    f.write(output_frontend)
