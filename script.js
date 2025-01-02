const input_area = document.getElementById("input-area");
input_area.addEventListener("focus", () => {
    intervalId = setInterval(initiate, 200); // Run every 1 second
});

// Stop the loop when the textarea loses focus
input_area.addEventListener("blur", () => {
    clearInterval(intervalId); // Stop the interval
});

let old = "";
function initiate () {
    let text = document.getElementById("input-area").value;
    let output = document.getElementById("output-area");
    let options = document.getElementsByClassName("options");
    for (var i = 0; i < options.length; i++) {
       options[i].style.display = "none";
    }

    let cursorPosition = document.getElementById("input-area").selectionStart;
    let start = cursorPosition;
    while (start > 0 && /\S/.test(text[start - 1])) {
        start--;
    }
    let end = cursorPosition;
    while (end < text.length && /\S/.test(text[end])) {
        end++;
    }

    let word = text.slice(start, end);

    const tokens = text.split(/\s+/); // Split by whitespace
    let charIndex = 0;

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
        let context = output.value;
        let s = context.substring(0, deleted) + context.substring(deleted + 1);
        output.value = s;
    }

    if (word in jsonData) {
        if (index >= options.length) {
            document.getElementById("options-wrapper").innerHTML += `<div class="options" style="display: flex; flex-direction: column"></div>`;
            for (var i = 0; i < jsonData[word].length; i++) {
                if (i == 0) {
                    document.getElementsByClassName("options")[index].innerHTML += `<label><input name="${word}_${index}" type="radio" class="${index}" value="${jsonData[word][i]}" onclick="editOutput(${index}, '${jsonData[word][i]}')" checked>${jsonData[word][i]}</label>`
                } else {
                    document.getElementsByClassName("options")[index].innerHTML += `<label><input name="${word}_${index}" type="radio" class="${index}" value="${jsonData[word][i]}" onclick="editOutput(${index}, '${jsonData[word][i]}')">${jsonData[word][i]}</label>`
                }
            }
            output.value += jsonData[word][0];
        } else {
            let check_name = document.getElementsByClassName(`${index}`)[0].name;
            check_name = check_name.substring(0, check_name.indexOf("_"));
            if (word == check_name) {
                options[index].style.display = "flex";
                let radios = document.getElementsByClassName(`${index}`);
                let m = "";
                for (var i = 0; i < radios.length; i++) {
                    if (radios[i].checked) {
                        m = radios[i].value;
                        break;
                    }
                }
                let context = output.value;
                let s = context.substring(0, index) + m + context.substring(index + 1);
                output.value = s;
            } else {
                let set = document.getElementsByClassName("options")[index];
                set.innerHTML = "";
                for (var i = 0; i < jsonData[word].length; i++) {
                    if (i == 0) {
                        set.innerHTML += `<label><input name="${word}_${index}" type="radio" class="${index}" value="${jsonData[word][i]}" onclick="editOutput(${index}, '${jsonData[word][i]}')" checked>${jsonData[word][i]}</label>`
                    } else {
                        set.innerHTML += `<label><input name="${word}_${index}" type="radio" class="${index}" value="${jsonData[word][i]}" onclick="editOutput(${index}, '${jsonData[word][i]}')">${jsonData[word][i]}</label>`
                    }
                }
                let context = output.value;
                let s = context.substring(0, index) + jsonData[word][0] + context.substring(index + 1);
                output.value = s;
            }
        }
    } else if (/^[a-zA-Z\s]+$/.test(word)) {
        let context = output.value;
        let s = context.substring(0, index) + "X" + context.substring(index + 1);
        output.value = s;
    }
    old = text;
}

function editOutput(index, word) {
    let output = document.getElementById("output-area");
    let context = output.value;
    let s = context.substring(0, index) + word + context.substring(index + 1);
    output.value = s;
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