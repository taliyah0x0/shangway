const input_area = document.getElementById("input-area");
input_area.addEventListener("focus", () => {
    intervalId = setInterval(initiate, 200); // Run every 1 second
});

// Stop the loop when the textarea loses focus
input_area.addEventListener("blur", () => {
    clearInterval(intervalId); // Stop the interval
});

let save = [];

let old = "";
function initiate () {
    let text = document.getElementById("input-area").innerHTML;
    text = text.replace(/&nbsp;/g, " ");
    let output = document.getElementById("output-area");
    let options = document.getElementsByClassName("options");
    for (var i = 0; i < options.length; i++) {
       options[i].style.display = "none";
    }

    const selection = window.getSelection();
    let cursorPosition = 0;

    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0); // Get the first range of the selection
        const preCaretRange = range.cloneRange(); // Clone the range
        preCaretRange.selectNodeContents(document.getElementById("input-area")); // Set the cloned range to the start of the editable div
        preCaretRange.setEnd(range.startContainer, range.startOffset); // Set the end of the range to the caret
        cursorPosition = preCaretRange.toString().length; // Get the length of the text in the range
    }

    let start = cursorPosition;
    while (start > 0 && /\S/.test(text[start - 1])) {
        start--;
    }
    let end = cursorPosition;
    while (end < text.length && /\S/.test(text[end])) {
        end++;
    }

    let word = text.slice(start, end);

    let tokens = text.split(/(\s+|[^\w\s])/g).filter(token => token.trim());
    let charIndex = 0;

    let index = 0;
    for (let i = 0; i < tokens.length; i++) {
        const tokenStart = charIndex;
        const tokenEnd = charIndex + tokens[i].length;

        // Check if the cursor position is within the current token
        if (cursorPosition >= tokenStart && cursorPosition <= tokenEnd) {
            index = i;
            break;
        }

        // Advance the character index, accounting for spaces between tokens
        charIndex = tokenEnd + 1; // +1 for the space
    }

    const originalTokens = old.split(/\s+/);
    let deleted = -1;
    for (let i = 0; i < originalTokens.length; i++) {
        if (originalTokens[i] !== tokens[i]) {
            deleted = i; // Index of the deleted word
            break;
        }
    }

    // If one word was removed at the end, the loop might not catch it
    if (originalTokens.length > tokens.length) {
        deleted = originalTokens.length - 1;
    }

    if (deleted != -1) {
        let context = output.innerHTML;
        let s = context.substring(0, deleted) + context.substring(deleted + 1);
        output.innerHTML = s;
        correctHighlight(deleted);
    }

    if (word in jsonData) {
        if (index >= options.length) {
            document.getElementById("options-wrapper").innerHTML += `<div class="options" style="display: flex; flex-direction: column"></div>`;
            for (var i = 0; i < jsonData[word].length; i++) {
                document.getElementsByClassName("options")[index].innerHTML += `<label><input name="${word}_${index}" type="radio" class="${index}" value="${jsonData[word][i]}" onclick="editOutput(${index}, '${word}', ${i})">${jsonData[word][i]}</label>`;
            }
            document.getElementsByClassName(`${index}`)[0].checked = true;
            output.innerHTML += jsonData[word][0];
            correctHighlight(index);
            save.push(0);
        } else {
            let check_name = document.getElementsByClassName(`${index}`)[0].name;
            check_name = check_name.substring(0, check_name.indexOf("_"));
            if (word == check_name) {
                options[index].style.display = "flex";
                let radios = document.getElementsByClassName(`${index}`);
                let m = radios[save[index]].value;
                radios[save[index]].checked = true;
                let context = output.innerHTML;
                let s = context.substring(0, index) + m + context.substring(index + 1);
                output.innerHTML = s;
                correctHighlight(index);
                document.getElementById("highlight-area").innerHTML = text;
                unboldAll("highlight-area");
                boldword("highlight-area", index);
            } else {
                let set = document.getElementsByClassName("options")[index];
                set.innerHTML = "";
                for (var i = 0; i < jsonData[word].length; i++) {
                    set.innerHTML += `<label><input name="${word}_${index}" type="radio" class="${index}" value="${jsonData[word][i]}" onclick="editOutput(${index}, '${word}', ${i})">${jsonData[word][i]}</label>`;
                }
                save[index] = 0;
                document.getElementsByClassName(`${index}`)[0].checked = true;
                let context = output.innerHTML;
                let s = context.substring(0, index) + jsonData[word][0] + context.substring(index + 1);
                output.innerHTML = s;
                correctHighlight(index);
            }
        }
    } else if (/^[a-zA-Z\s]+$/.test(word)) {
        let context = output.innerHTML;
        let s = context.substring(0, index) + "X" + context.substring(index + 1);
        output.innerHTML = s;
        correctHighlight(index);
    }
    old = text;
}

function correctHighlight(index) {
    const highlightDiv = document.getElementById("highlight-area-2");
    highlightDiv.innerHTML = document.getElementById("output-area").innerHTML;
    unboldAll("highlight-area-2");
    boldChar("highlight-area-2", index);
}

function editOutput(index, word, radio) {
    let output = document.getElementById("output-area");
    let context = output.innerHTML;
    let s = context.substring(0, index) + jsonData[word][radio] + context.substring(index + 1);
    output.innerHTML = s;
    save[index] = radio;
}

function unboldAll(element) {
    const highlightDiv = document.getElementById(`${element}`);

    function removeBoldTags(node) {
        if (!node) return;

        if (node.nodeName === "span") {
            // Replace the bold node with its text content
            while (node.firstChild) {
                node.parentNode.insertBefore(node.firstChild, node);
            }
            node.parentNode.removeChild(node);
        } else if (node.hasChildNodes()) {
            // Recursively process child nodes
            Array.from(node.childNodes).forEach(removeBoldTags);
        }
    }

    // Start processing from the highlightDiv
    Array.from(highlightDiv.childNodes).forEach(removeBoldTags);
}

function boldword(element, index) {
    const highlightDiv = document.getElementById(`${element}`);

    function wrapTokenAtIndex(node, tokenIndex) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.nodeValue;
            const tokens = text.split(/\s+/); // Split text into tokens
            let charIndex = 0;

            // Traverse tokens to find the target token at the given index
            for (let i = 0; i < tokens.length; i++) {
                const tokenStart = charIndex;
                const tokenEnd = charIndex + tokens[i].length;

                if (i === tokenIndex) {
                    const parent = node.parentNode;

                    // Split the text around the target token
                    const before = text.slice(0, tokenStart);
                    const target = text.slice(tokenStart, tokenEnd);
                    const after = text.slice(tokenEnd);

                    // Replace the original text node with new nodes
                    if (before) parent.insertBefore(document.createTextNode(before), node);

                    const boldElement = document.createElement('span');
                    boldElement.style.fontWeight = 'bold';
                    boldElement.textContent = target;
                    parent.insertBefore(boldElement, node);

                    if (after) parent.insertBefore(document.createTextNode(after), node);

                    parent.removeChild(node); // Remove the original text node
                    return;
                }

                // Update charIndex to the next token
                charIndex = tokenEnd + 1; // +1 for the space
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Process child nodes recursively
            Array.from(node.childNodes).forEach(child => wrapTokenAtIndex(child, tokenIndex));
        }
    }

    wrapTokenAtIndex(highlightDiv, index);
}

function boldChar(element, index) {
    const container = document.getElementById(`${element}`);

    function wrapCharInTextNode(node, charIndex) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.nodeValue;

            if (charIndex >= 0 && charIndex < text.length) {
                const parent = node.parentNode;

                // Split the text into three parts: before, target character, and after
                const before = text.slice(0, charIndex);
                const target = text.charAt(charIndex);
                const after = text.slice(charIndex + 1);

                // Replace the original text node with new nodes
                if (before) parent.insertBefore(document.createTextNode(before), node);

                const wrappedChar = document.createElement('span');
                wrappedChar.style.backgroundColor = 'yellow'; // Highlight style
                wrappedChar.textContent = target;
                parent.insertBefore(wrappedChar, node);

                if (after) parent.insertBefore(document.createTextNode(after), node);

                parent.removeChild(node); // Remove the original text node
                return;
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Traverse child nodes recursively
            for (let child of Array.from(node.childNodes)) {
                const charLength = child.textContent.length;
                if (charIndex < charLength) {
                    wrapCharInTextNode(child, charIndex);
                    return;
                } else {
                    charIndex -= charLength;
                }
            }
        }
    }

    wrapCharInTextNode(container, index);
}

let jsonData; // Global variable to store the fetched JSON
fetch(`output.json`)
    .then((response) => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.json(); // Parse the JSON
    })
    .then((data) => {
        jsonData = data; // Store the JSON data in the global variable
        console.log("JSON data fetched and stored:", jsonData);
    })
    .catch((error) => {
        console.error("Error fetching the JSON file:", error);
    });