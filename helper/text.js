module.exports = {
    extract: function (text) {
        var newText = text; 
        console.log(text)

        var stopChar= [' ', '\n', '\t']
        var ignore=false

        if (text) {
            if(text[0] === '"'){
                newText = text.replace('"', '')
                stopChar = ['"'];
                ignore = true;
            }else if(text[0] === "'"){
                newText = text.replace("'", '')
                stopChar = ["'"];
                ignore = true;
            }

            // console.log(newText, stopChar, ignore)
            var index = text.length;
            for (char in newText){
                // console.log(char, stopChar.includes(newText[char]))
                if(stopChar.includes(newText[char])){
                    if(ignore){
                        if(newText[char-1] !== '\\'){
                            index = char-0;
                            break;
                        }
                    }else{
                        index = char-0;
                        break;
                    }
                }
            }
            if(ignore){
                return [newText.substring(0, index).trim(), newText.substring(index+1).trim()];
            }
            return [text.substring(0, index).trim(), text.substring(index+1).trim()];
        }else{
            return []
        }
    }
}