var canvas = document.getElementById('coverCanvas'),
    secret = document.getElementById('secretCanvas'),
    coverAfter = document.getElementById('coverAfterCanvas'),
    ctx = canvas.getContext( '2d' ),
    ctxSecret = secret.getContext( '2d' ),
    ctxCoverAfter = coverAfter.getContext( '2d' ),
    plainTextFile = document.getElementById( 'plainTextFile' ),
    loadFile = document.getElementById( 'loadFile' ),
    plainTextData,
    coverImgData,
    index = 0,
	capacityBytes,
	capacityLeft;
	
plainTextFile.addEventListener( 'change', function ( e ) {

    var file = e.target.files[ 0 ];
    var fr = new FileReader();

    fr.addEventListener( "load", loadEvent );

    function loadEvent ( evt ) {

        if ( evt.target.readyState == FileReader.DONE ) {
            // returned arraybuffer object
            var arrayBuffer = evt.target.result;
            // assign arraybuffer to signed int8array instead of normal array
            // 1 byte per index, and only store to 256 values
            plainTextData = new Uint8Array( arrayBuffer );
			$('#plainText').val(String.fromCharCode.apply(null, plainTextData));
			console.log( plainTextData );
			$('#plainText').trigger('change');
        }

    }
    // read as arraybuffer
    fr.readAsArrayBuffer( file );

});

hideData.addEventListener( 'click', function (e ) {
	$('#hidingSuccess').hide();

    // start reading & replacing bits
	readByte( plainTextData );
	//console.log(coverImgData);
	// draw canvas using image data instead or img object
	ctxSecret.putImageData( coverImgData, 0, 0 );
	
	const exportData = coverImgData.data.toString().replace(/,/g, '\n');
	//saveTextArray( [exportData], 'original.txt' );
	
	$('#hidingSuccess').show();
});

/**
* reading secret's bit for every character set's code
*/
function readByte( secret ) {
	
    for ( var i = 0, length = secret.length; i < length; i++ ) {

        if ( i == 0 ) {
            // on first bit, store the length of secret data
            // must multiple by 4, as one character's code containing
            // 8bits, thus this 8bits divide by 2. every 2 bits should replace
            // the LSB(Least significant bit) of pixel's byte
            var secretLength = length;
            console.info( 'Secret Length(' + length + 'x4) : ' + secretLength )
            // as our imageData is a typed array(Uint8coverImgData)
            // it only can store value not more than 256(8bit or 1byte)
            if ( secretLength > 255 ) {
				// check how many times should we need imageData's index
                // to store our secret's length
                var division = secretLength / 255;
                // integer number
                if ( division % 1 === 0 ) {
                    for ( var k = 0; k < division; k++ ) {
                        coverImgData.data[ k ] = 255;
                        index++;
                    }
                }
                // float number
                else {

                    var firstPortion = division.toString().split(".")[ 0 ];
                    var secondPortion = division.toString().split(".")[ 1 ];

                    for ( var k = 0; k < firstPortion; k++ ) {
                        coverImgData.data[ k ] = 255;
                        index++;
                    }

                    var numberLeft = Math.round( ( division - firstPortion ) * 255 );
                    console.info( 'numberLeft : ' + numberLeft )
                    coverImgData.data[ k ] = numberLeft;
                    index++;
                }

            } else {
                coverImgData.data[ 0 ] = secretLength;
                index++;
            }

            console.log( 'sss : ' + coverImgData.data[ 0 ] )

        }

        var asciiCode = secret[ i ];
        // use masking, to clear bit, and take the bit we want only
        // Take only first 2 bit, eg : 0111 0011 => 0000 0011
        var first2bit = ( asciiCode & 0x03 ); // 0x03 = 3
        // Take only first 4 bit(2bit at the end), eg : 0111 0011 => 0000 0000
        var first4bitMiddle = ( asciiCode & 0x0C ) >> 2; // 0x0C = 12, shift to the right 2 bit or divide by 2^2, as we want to take first 2 bit at the end
        // Take only first 6 bit(2bit at the end), eg : 0111 0011 => 0011 0000
        var first6bitMiddle = ( asciiCode & 0x30 ) >> 4; // 0x30 = 48, shift to the right 4 bit or divide by 2^4, as we want to take first 2 bit at the end
        // Take only first 8 bit(2bit at the end), eg : 0111 0011 => 0100 0000
        var first8bitMiddle = ( asciiCode & 0xC0 ) >> 6; // 0xC0 = 192, shift to the right 6 bit or divide by 2^6, as we want to take first 2 bit at the end
        //console.log(i + ' : ' + first2bit);
        //console.log(i + ' : ' + first4bitMiddle);
        //console.log(i + ' : ' + first6bitMiddle);
        //console.log(i + ' : ' + first8bitMiddle);
        // start replacing our secret's bit on LSB
        replaceByte( first2bit );
        replaceByte( first4bitMiddle );
        replaceByte( first6bitMiddle );
        replaceByte( first8bitMiddle );


    }
}

/**
* replace bits for each imageData's byte
*/
function replaceByte ( bits ) {
    // clear the first two bit(LSB) using &
    // and replacing with secret's bit
	if(index < coverImgData.data.length)
	{
		if(index%4==3 && index < (coverImgData.data.length-1)){
			coverImgData.data[ index ]=255; index++;
		} 
		coverImgData.data[ index ] = ( coverImgData.data[ index ] & 0xFC ) | bits;
		index++;
	}

}
/**
* save/force download data
* Credit to : http://stackoverflow.com/users/1086928/syntax
*/
var saveByteArray = (function() {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    return function(data, name) {
        var blob = new Blob(data, {
                type: "octet/stream"
            }),
            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = name;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());
//saveByteArray( result.split(''), 'cubaan.txt' );

var saveTextArray = (function() {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    return function(data, name) {
        var blob = new Blob(data, {
                type: 'text/csv;charset=utf-8;'
            }),
            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = name;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());

var saveImage = function(targetCanvas, filename) {
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
	
  a.download = filename+'.png';
  a.href = document.getElementById(targetCanvas).toDataURL()
  a.click();
}

var decodedResult="";

function saveDecodedText()
{
	saveByteArray( decodedResult.split(''), 'decoded.txt' );
}

loadFile.addEventListener( 'change', function ( e ) {

    var file = e.target.files[ 0 ];
    var fr = new FileReader();

    fr.addEventListener( "loadend", loadEndEvent );

    function loadEndEvent ( e ) {

        var img = new Image();
       
        // wait for image finish load
        // then draw image into canvas
        img.onload = function () {
			
			
			console.log("loaded cover image size:"+this.width + 'x' + this.height);
			
			document.getElementById('coverAfterCanvas').width = this.width;
			document.getElementById('coverAfterCanvas').height = this.height;
			
			ctxCoverAfter = coverAfter.getContext( '2d' )
			
            ctxCoverAfter.drawImage( img, 0, 0 );
            // returned arraybuffer object
            //var arrayBuffer = evt.target.result;
            // assign arraybuffer to unsigned int8array instead of normal array
            // 1 byte per index, and only store to 256 values
            //var loadView = new Uint8Array(arrayBuffer);
            var loadView = ctxCoverAfter.getImageData( 0, 0, coverAfter.height, coverAfter.width );
            console.log( loadView )
            var totalLength = 0;
            var lastIndex;
			// loop over all the pixel's bit
            // sum up all the length(secret data's length)
			
			const exportData = loadView.data.toString().replace(/,/g, '\n');
			//saveTextArray( [exportData], 'modified.txt' );
			
            for ( var b = 0, viewLength = loadView.data.length; b < viewLength; b++ ) {
               	// get the length for matched index only
                if (loadView.data[ b ] == 255) {
                    totalLength += loadView.data[ b ];
                    if (loadView.data[ b + 1 ] < 255) {
                        totalLength += loadView.data[ b + 1 ];
                        lastIndex = b + 1;
                        break;
                    }
                } else {
                    totalLength += loadView.data[ b ];
                    lastIndex = b;
                    break;
                }
            }
            console.info( 'Total length :' + totalLength + ', Last Index : ' + lastIndex )
                // get first index - secret's length
            var secretLength = totalLength;
            // instantiate Unsigned array(8 bit)
            // divided by 4 as one character code equal to 8bit
            var newUint8Array = new Uint8Array( totalLength );
            var j = 0;
            // start extracting the bits from pixel
            for ( var i = ( lastIndex + 1 ); i < loadView.data.length; i = i++) {
				// we only need the first 2 bit from each byte
                // as those 2bits contains our secret data's bit
                // first, clear the unused bit using mask(3) == 0000 0011
                // then shifting left for each bit(ordering)
                // staying at its own location
				var aShift,bShift,cShift,dShift;
				if(i%4==3) i++;
                aShift = ( loadView.data[ i++ ] & 3 );
				if(i%4==3) i++;
                bShift = ( loadView.data[ i++] & 3 ) << 2;
				if(i%4==3) i++;
                cShift = ( loadView.data[ i++] & 3 ) << 4;
				if(i%4==3) i++;
                dShift = ( loadView.data[ i++] & 3 ) << 6;
                // final, merge/combine all shifted bits to form a byte(8bits)
                var result = ( ( ( aShift | bShift) | cShift ) | dShift );
                // store the result(single byte) into unsigned integer
                newUint8Array[ j ] = result;
                j++;
				if(j==secretLength)
					break;

            }
            console.log( newUint8Array )
            // decode collection of unsigned integer into ASCII character set
            decodedResult = decodeUtf8( newUint8Array );
            //console.log( result )
            
			//saveByteArray( result.split(''), 'cubaan.txt' );
			$('#decodedText').val(decodedResult);
			$('#decodeSuccess').show();
        }
		img.src = e.target.result;
    }

    // read as dataUrl(base64)
    fr.readAsDataURL( file );

});

/**
* decode character's code into character
* Credit to http://ciaranj.blogspot.my/2007/11/utf8-characters-encoding-in-javascript.html
*/
function decodeUtf8(arrayBuffer) {
    var result = "";
    var i = 0;
    var c = 0;
    var c1 = 0;
    var c2 = 0;

    var data = new Uint8Array(arrayBuffer);

    // If we have a BOM skip it
    if (data.length >= 3 && data[0] === 0xef && data[1] === 0xBB && data[2] === 0xBF) {
        i = 3;
    }

    while (i < data.length) {
        c = data[i];

        if (c < 128) {
            result += String.fromCharCode(c);
            i++;
        } else if (c > 191 && c < 224) {
            if (i + 1 >= data.length) {
                throw "UTF-8 Decode failed. Two byte character was truncated.";
            }
            c2 = data[i + 1];
            result += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
            i += 2;
        } else {
            if (i + 2 >= data.length) {
                throw "UTF-8 Decode failed. Multi byte character was truncated.";
            }
            c2 = data[i + 1];
            c3 = data[i + 2];
            result += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            i += 3;
        }
    }
    return result;
}

function str2ab(str) {
  var buf = new ArrayBuffer(str.length); 
  var bufView = new Uint8Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return bufView;
}

document.getElementById('plainText').onchange=(function () {
		
		plainText=$('#plainText').val()
		var textlenspace=0;		
		if(plainText%255==0) textlenspace=Math.floor(plainText.length/255);
		else textlenspace=Math.floor(plainText.length/255)+1;
		
		plainTextData = str2ab(plainText);
		capacityLeft = capacityBytes-(plainTextData.length);
		
		document.getElementById('imgLen').innerHTML = (capacityLeft-textlenspace)+ " characters storage left.";
	});

document.getElementById('plainText').onkeyup = function () {
	//document.getElementById('textLen').innerHTML = "Characters: " + (this.value.length);
	
	plainText=this.value
	var textlenspace=0;
	if(plainText%255==0) textlenspace=Math.floor(plainText.length/255);
	else textlenspace=Math.floor(plainText.length/255)+1;
	
	plainTextData = str2ab(plainText);
	capacityLeft = capacityBytes-(plainTextData.length);
	
	document.getElementById('imgLen').innerHTML = (capacityLeft-textlenspace)+ " characters storage left.";
};

document.getElementById('cover').onchange = function() {
    
	var cover = document.getElementById('cover');
	var file = cover.files[ 0 ];
    var fr = new FileReader();

    fr.addEventListener( "load", loadEvent );
    fr.addEventListener( "loadend", loadEndEvent );

    function loadEvent ( e ) {
        console.info( 'loading cover image started...' );
    }

    function loadEndEvent ( e ) {
        console.info( 'cover image loadig finished.' );
        var img = new Image();
        img.onload = function () {
			
			//console.log("loaded cover image size:"+this.width + 'x' + this.height);
			
			document.getElementById('coverCanvas').width = this.width;
			document.getElementById('coverCanvas').height = this.height;
			
			document.getElementById('secretCanvas').width = this.width;
			document.getElementById('secretCanvas').height = this.height;			
			
			var ctx = canvas.getContext( '2d' )
            ctx.drawImage( img, 0, 0 );
			
			coverImgData = ctx.getImageData( 0, 0, canvas.height, canvas.width );
            capacityBytes= (coverImgData.data.length - Math.floor(coverImgData.data.length/4))/4;
			
			document.getElementById('imgLen').innerHTML = (capacityBytes)+ " characters storage left.";
			
            
		}
		
        img.src = e.target.result;		

	}
	
	fr.readAsDataURL( file );

}
