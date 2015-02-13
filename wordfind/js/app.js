/*
 *
 * WordFind by Ryan Hoshor <ryan@farmsoftstudios.com>
 * © 2011 FarmSoft Studios 

The MIT License (MIT)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

var currWord    = [];
var wordList    = [];
var letters     = [];

// Global Sounds
var audio           = new Audio();
var popSound        = new Audio("sounds/pop.wav");
var successSound    = new Audio("sounds/success.wav");

// Global Vars
var originalWordsLength, wordsTable;


// Letters Array
letters = ["a", "b", "c", "d",
           "e", "f", "g", "h",
           "i", "j", "k", "l",
           "m", "n", "o", "p",
           "q", "r", "s", "t",
           "u", "v", "w", "x",
           "y", "z"];

$(function() {
    
    var i, l;
        
    // No scrolling when installed
    $('body').bind("touchmove", {}, function(event){
      event.preventDefault();
    });

    // PREload the sounds
    popSound.addEventListener('canplaythrough', preloadSounds, false);
    successSound.addEventListener('canplaythrough', preloadSounds, false);  
        
    // JSON representation of the table. sorting manually from longest
	// to shortest to prevent intersections

	var wordsTable = $.getJSON( "words.json", function() {
		// Tracking the original length of the array so we can calculate
		// the offset of deleted words.
		originalWordsLength = wordsTable.words.length;
		
		// show the status bar.
		$('#status').html("You have "+wordsTable.words.length+" words remaining.");
		
	    // Create the wordlist
		displayWordList(wordsTable);
    
		// Create the word Table
		displayWordTable(wordsTable);
		
		// Init the table
	    i = 0, l = wordsTable.words.length;
	    while(l > i){
	        wordList[i] = [];
	        if(scrambleWordsInTable(wordsTable.words[i], wordsTable, i)){
	            i++;
	        }
	    }
	
	}).fail(function() {
		console.log( "There was an error fetching JSON" );
	});
  
    // Table Click events
    $('table.puzzle td').click(function(e) {
        //The element that sent the click event.
        var el = e.target;
        //popSound.play();
        //console.log('[' + el.id + '] (' + el.innerHTML + ')');
        // Prevent rouge clicks from ruining the array
        // Also, loop throught the array and make sure there aren't
        // any duplicate entries.
        //console.log(currWord)
        if (currWord.indexOf(el.id) == -1) {
            $(el).addClass('clicked');
            currWord.push(el.id);
            findWord(currWord);
        } else {
            // If you click on a letter twice, it removes it from the array and resets it.
            $(el).removeClass('clicked');
            currWord = $.removeFromArray(el.id, currWord);
            findWord(currWord);
        }
    });
    

    
    // Button Click Event
    $('#button').click(function(e) {
        document.location.reload();
    });
    
    // fill the table with dummy chars.
    fillTable();
    
});


// Populate the words list with the unscrambled original words
function displayWordTable(JSONData) {
    // clone the object
    var JSON = jQuery.extend(true, {}, JSONData);
    
    // create the table
    $('#puzzlecontainer').append('<table id="' + JSON.id + '"></table>');
    
    // Make as many rows as are specified in the JSON file
    for(var i = 0; i < JSON.height; i++){
        $('#puzzle').append('<tr id="row_' + i + '"></tr>').addClass('puzzle');
        for(var ii = 0; ii < JSON.width; ii++){
            $('#row_' + i).append('<td id="' + i + ii + '">~</td>');
        }
    }
}


// Populate the words list with the unscrambled original words
function displayWordList(JSONData) {
    // clone the object
    var JSON = jQuery.extend(true, {}, JSONData);
    
    $.each(JSON.words, function(i, val) {
        //console.log(val);
        $('#wordlist').append('<li id="wordlist_' + i + '"></li>')
        $('#wordlist_' + i).addClass('wordlist').html(val);
    });
}


// function to init the table, and fill it with randomized words
function scrambleWordsInTable (currWord, JSONData, wordsID) {
    var t, i, l, i0, id0, i1, i2, i3, id3, id, newRow, newCol, currWordLength, direction, delim;
    
    var tempWord = [];
    
    // delim represents the filler character that is in the table view.
    delim = "~";

    console.log('Adding word to puzzle: ' + currWord + '. id: ' + wordsID);
    
    // Random orientation for the word
    direction = Math.floor(Math.random()*3);
    //direction = 3;
    
    error = "FALSE"
    
    // run the actual placment based upon the 
    switch(direction) {
        case 0:
        // Make the word go upwards, backwards
        newRow = Math.floor(Math.random()*JSONData.height);
        newCol = Math.floor(Math.random()*(JSONData.width - currWord.length))
        
        // Reverse incrementer to make it go backwards
        id0 = 0;
        
        for(i0 = currWord.length; i0--;) {
            
            id = '#' + id0 + "" + newRow + "";
            
            //console.log(currWord[i0] + " in id: " + id);
            if($(id).text() === delim){
                tempWord[i0] = id + '|' + currWord[i0];
                error = 'FALSE';
            } else {
                error = 'Word: ' + currWord + ' North Fail';
                break;
            }
            id0++;
        }
        break;
        case 1:
        // Make the word go downwards, normal
        newRow = Math.floor(Math.random()*JSONData.height);
        newCol = Math.floor(Math.random()*(JSONData.width - currWord.length))
        
        for(i1 = 0; i1 < currWord.length; i1++) {
            id = '#' + (newCol + i1) + "" + newRow + "";
            if($(id).text() === delim){
                tempWord[i1] = id + '|' + currWord[i1];
                //console.log(currWord[i1]);
                error = 'FALSE';
            } else {
                error = 'Word: ' + currWord + ' South Fail';
                break;
            }
        }
        break;
        case 2:
        // Make the word go left to right, normal
        newRow = Math.floor(Math.random()*(JSONData.width - currWord.length));
        newCol = Math.floor(Math.random()*JSONData.height)
        
        for(i2 = 0, l = currWord.length; i2 < l; i2++) {
            id = '#' + newCol + "" + (newRow + i2) + "";
            if($(id).text() === delim){
                tempWord[i2] = id + '|' + currWord[i2];
                //console.log(currWord[i2]);
                error = 'FALSE';
            } else {
                error = 'Word: ' + currWord + ' East Fail';
                break;
            }
        }
        
        break;
        case 3:
        // Make the word go right to left, backwards
        newRow = Math.floor(Math.random()*(JSONData.height - currWord.length));
        newCol = Math.floor(Math.random()*JSONData.width)
        
        // Reverse incrementer to make it go backwards
        id3 = 0;
        
        for(i3 = currWord.length; i3--;) {
            id = '#' + newCol + "" + id3 + "";
            if($(id).text() === delim){
                tempWord[i3] = id + '|' + currWord[i3];
                error = 'FALSE';
            } else {
                error = 'Word: ' + currWord + ' West Fail';
                break;
            }
            id3++;
        }
        break;
    } // switch
    
    if(error === 'FALSE'){
        for(i = 0, l = tempWord.length; i < l; i++){
            t = tempWord[i].split('|');
            $(t[0]).text(t[1]);
            //console.log(wordsID + ' ' + i + ' ' + t[0])
            var wID = t[0].substring(1);
            wordList[wordsID][i] = wID;
        }
        return true;
    } else {
        console.log(error)
        return false;
    }
}


// if you find a word in the list, this should get fired.
// it will color the word green so you know you have a match

function findWord(currentWord) {                
    $.each(wordList, function(i, currWordInList) {
        //console.log("currentWord: "+currentWord+" currWord: "+currWord);
        
        // Make sure we are actually looping through an array
        if(currWordInList){
            if ($.arrayCompare(currWordInList, currentWord)) {
                // We found a word!
                popSound.pause();
                
                // cross it off in the list
                $("#wordlist_"+i).addClass('found');
                console.log("#wordlist_"+i+" added class .found");
                
                successSound.play();
                // Mark it found and alert the user 
                $.each(currentWord, function(i, l) {
                    $("#"+l).removeClass('clicked');
                    $("#"+l).addClass('selected');
                    $("#"+l).unbind('click');
                });
                
                // remove it from the word array
                //wordList.splice(i,1); // removes the value AND key.
                                        // Incorrectly counts the words because there isn't
                                        // a good way to reference the old word list.
                                        
                delete wordList[i];     // removes ONLY the values.
                
                // reset the current word arrays so we can move on to the next word
                currentWord = [];
                currWord    = [];
                
                // Update the word length counter.
                originalWordsLength--;
                
                //update the status.
                $('#status').html("You have "+originalWordsLength+" words remaining.");
                
                return true
            } else {
                popSound.play();
            }
        } // if currWordInList
    });
    
    // update the status field with the current stats.
    if(originalWordsLength > 1){
        $('#status').html("You have "+originalWordsLength+" words remaining.");
    } else if(originalWordsLength > 0){
        $('#status').html("Almost done! You only have 1 word left.");
    } else {
        $('#status').addClass('finished');
        $('#status').html("You have finished the Game!");
        $('div#finished').show();
    }
}

// From: http://stackoverflow.com/questions/1773069/using-jquery-to-compare-two-arrays/5186565#5186565
jQuery.extend({
    arrayCompare: function(arrayA, arrayB) {
        if (arrayA.length != arrayB.length) {
            return false;
        }
        // sort modifies original array
        // (which are passed by reference to our method!)
        // so clone the arrays before sorting
        var a = jQuery.extend(true, [], arrayA);
        var b = jQuery.extend(true, [], arrayB);
        a.sort();
        b.sort();
        for (var i = 0, l = a.length; i < l; i++) {
            if (a[i] !== b[i]) {
                return false;
            }
        }
        return true;
    }
});

// From:http://stackoverflow.com/questions/4825812/clean-way-to-remove-element-from-javascript-array-with-jquery-coffeescript/4825873#4825873
jQuery.removeFromArray = function(value, arr) {
    return jQuery.grep(arr, function(elem, index) {
        return elem !== value;
    });
};

// logs the sounds loaded.
function preloadSounds(){
    console.log("Loaded sound: " + this.id);
}

function fillTable() {
    randLetter = Math.floor(Math.random()*letters.length);
    
    // Loop through the elements of the table, and make sure that all the placeholders are turned into random letters.
    $('table.puzzle td').each(function(i,el){
        if(this.innerHTML === '~'){
            randLetter = Math.floor(Math.random()*letters.length);
            this.innerHTML = letters[randLetter];
        }
    });
}