var _coverImgData,
    _index = 0,
	_capacityBytes,
	_utf8mode=8,
	_decodedResult="";
	
document.getElementById( 'hidingTextFile' ).addEventListener( 'change', function ( e ) {

    var file = e.target.files[ 0 ];
    var fr = new FileReader();

    fr.addEventListener( "load", loadEvent );

    function loadEvent ( evt ) {
        if ( evt.target.readyState == FileReader.DONE ) {
			document.getElementById("hidingText").value= evt.target.result;
			document.getElementById("hidingText").onchange();
        }
    }
	fr.readAsText(file);

});

function hideData(){
	document.getElementById("hidingSuccess").style.display = "none";

	var plainText=document.getElementById("hidingText").value;
	var plainTextData = str2ab(plainText);
	
	embedData2Img( plainTextData );
	var secret = document.getElementById('secretCanvas');
	var ctxSecret = secret.getContext( '2d' );
	ctxSecret.putImageData( _coverImgData, 0, 0 );
	
	const exportData = _coverImgData.data.toString().replace(/,/g, '\n');
	//saveTextArray( [exportData], 'original.txt' );
	
	document.getElementById("hidingSuccess").style.display = "block";
	
	document.getElementById('btn_hideDataNext').click();
}

function embedData2Img( targetText ) {
	
	_index = 0;
	
    for ( var i = 0, length = targetText.length; i < length; i++ ) {

        if ( i == 0 ) {
            var secretLength = length;
            console.info( 'Secret Length(' + length + 'x4) : ' + secretLength )
            if ( secretLength > 255 ) {
                var division = secretLength / 255;
                if ( division % 1 === 0 ) {
                    for ( var k = 0; k < division; k++ ) {
                        _coverImgData.data[ k ] = 255;
                        _index++;
                    }
                }
                else {

                    var firstPortion = division.toString().split(".")[ 0 ];
                    var secondPortion = division.toString().split(".")[ 1 ];

                    for ( var k = 0; k < firstPortion; k++ ) {
                        _coverImgData.data[ k ] = 255;
                        _index++;
                    }

                    var numberLeft = secretLength- (firstPortion*255);
                    console.info( 'numberLeft : ' + numberLeft );
                    _coverImgData.data[ k ] = numberLeft;
                    _index++;
                }

            } else {
                _coverImgData.data[ 0 ] = secretLength;
                _index++;
            }
        }
		
		var asciiCode = targetText[ i ];
		
		if(_utf8mode==8)
		{
			var first2bit = ( asciiCode & 0x03 ); 
			var first4bitMiddle = ( asciiCode & 0x0C ) >> 2; 
			var first6bitMiddle = ( asciiCode & 0x30 ) >> 4;
			var first8bitMiddle = ( asciiCode & 0xC0 ) >> 6; 
			
			replaceByte( first2bit );
			replaceByte( first4bitMiddle );
			replaceByte( first6bitMiddle );
			replaceByte( first8bitMiddle );
		
		}
		else if(_utf8mode==16)
		{
			var first2bit = ( asciiCode & 0x0003 ); 
			var first4bitMiddle = ( asciiCode & 0x000C ) >> 2; 
			var first6bitMiddle = ( asciiCode & 0x0030 ) >> 4; 
			var first8bitMiddle = ( asciiCode & 0x00C0 ) >> 6; 
			var first10bitMiddle = ( asciiCode & 0x0300 ) >> 8; 
			var first12bitMiddle = ( asciiCode & 0x0C00 ) >> 10; 
			var first14bitMiddle = ( asciiCode & 0x3000 ) >> 12; 
			var first16bitMiddle = ( asciiCode & 0xC000 ) >> 14; 
			
			replaceByte( first2bit );
			replaceByte( first4bitMiddle );
			replaceByte( first6bitMiddle );
			replaceByte( first8bitMiddle );
			replaceByte( first10bitMiddle );
			replaceByte( first12bitMiddle );
			replaceByte( first14bitMiddle );
			replaceByte( first16bitMiddle );
		}
    }
}

function replaceByte ( bits ) {
	if(_index < _coverImgData.data.length)
	{
		if(_index%4==3 && _index < (_coverImgData.data.length-1)){
			_coverImgData.data[ _index ]=255; _index++;
		} 
		_coverImgData.data[ _index ] = ( _coverImgData.data[ _index ] & 0xFC ) | bits;
		_index++;
	}

}

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

function saveDecodedText()
{
	saveByteArray( _decodedResult.split(''), 'decoded.txt' );
}

var loadFile = document.getElementById( 'loadFile' );
loadFile.addEventListener( 'change', function ( e ) {

    var file = e.target.files[ 0 ];
    var fr = new FileReader();

    fr.addEventListener( "loadend", loadEndEvent );

    function loadEndEvent ( e ) {

        var img = new Image();
       
        img.onload = function () {
			
			console.log("loaded cover image size:"+this.width + 'x' + this.height);
			
			document.getElementById('decodedCanvas').width = this.width;
			document.getElementById('decodedCanvas').height = this.height;
			
			var coverAfter = document.getElementById('decodedCanvas'),
			ctxCoverAfter = coverAfter.getContext( '2d' )
			
            ctxCoverAfter.drawImage( img, 0, 0 );
            var loadView = ctxCoverAfter.getImageData( 0, 0, coverAfter.width, coverAfter.height );
            console.log( loadView )
            var totalLength = 0;
            var lastIndex;
			
			const exportData = loadView.data.toString().replace(/,/g, '\n');
			
            for ( var b = 0, viewLength = loadView.data.length; b < viewLength; b++ ) {
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
            console.info( 'Total length :' + totalLength + ', Last Index : ' + lastIndex );
            var secretLength = totalLength;
			
			if(_utf8mode==8)
			{
				var newUint8Array = new Uint8Array( totalLength );
				var j = 0;
				for ( var i = ( lastIndex + 1 ); i < loadView.data.length; i = i++) {
					var aShift,bShift,cShift,dShift;
					if(i%4==3) i++;
					aShift = ( loadView.data[ i++ ] & 3 );
					if(i%4==3) i++;
					bShift = ( loadView.data[ i++] & 3 ) << 2;
					if(i%4==3) i++;
					cShift = ( loadView.data[ i++] & 3 ) << 4;
					if(i%4==3) i++;
					dShift = ( loadView.data[ i++] & 3 ) << 6;
					var result = ( ( ( aShift | bShift) | cShift ) | dShift );
					newUint8Array[ j ] = result;
					j++;
					if(j==secretLength)
						break;

				}
				console.log( newUint8Array )
				_decodedResult = ab2str(newUint8Array); 
			}
			else if(_utf8mode==16)
			{
				var newUint16Array = new Uint16Array( totalLength );
				var j = 0;
				for ( var i = ( lastIndex + 1 ); i < loadView.data.length; i = i++) {
					var aShift,bShift,cShift,dShift,eShift,fShift,gShift,hShift;;
					if(i%4==3) i++;
					aShift = ( loadView.data[ i++ ] & 3 );
					if(i%4==3) i++;
					bShift = ( loadView.data[ i++] & 3 ) << 2;
					if(i%4==3) i++;
					cShift = ( loadView.data[ i++] & 3 ) << 4;
					if(i%4==3) i++;
					dShift = ( loadView.data[ i++] & 3 ) << 6;
					if(i%4==3) i++;
					eShift = ( loadView.data[ i++] & 3 ) << 8;
					if(i%4==3) i++;
					fShift = ( loadView.data[ i++] & 3 ) << 10;
					if(i%4==3) i++;
					gShift = ( loadView.data[ i++] & 3 ) << 12;
					if(i%4==3) i++;
					hShift = ( loadView.data[ i++] & 3 ) << 14;
					var result = ( ( aShift | bShift) | cShift | dShift | eShift | fShift | gShift | hShift);
					newUint16Array[ j ] = result;
					j++;
					if(j==secretLength)
						break;

				}
				console.log( newUint16Array )
				_decodedResult = ab2str(newUint16Array);
			}
			
			document.getElementById("decodedText").value=_decodedResult;
			document.getElementById("decodeSuccess").style.display = "block";
        }
		img.src = e.target.result;
    }

    fr.readAsDataURL( file );

});

function str2ab(str) {
	var buf = null, bufView=null;
	if(_utf8mode==8)
	{
		buf = new ArrayBuffer(str.length); 
		bufView = new Uint8Array(buf);
	}
	else if(_utf8mode==16)
	{
		buf = new ArrayBuffer(str.length*2); 
		bufView = new Uint16Array(buf);	
	}
		
	for (var i=0, strLen=str.length; i<strLen; i++) {
		bufView[i] = str.charCodeAt(i);
	}
	return bufView;
  
}

function ab2str(buf) {
	if(_utf8mode==8)
		return String.fromCharCode.apply(null, new Uint8Array(buf));
	else if(_utf8mode==16)
		return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function checkImageCapacity()
{
	var plainText=document.getElementById("hidingText").value;
	
	var textlenspace=0;		
	if(plainText.length%255==0) textlenspace=Math.floor(plainText.length/255);
	else textlenspace=Math.floor(plainText.length/255)+1;
	
	var plainTextData = str2ab(plainText);
	var maxCharLen= _capacityBytes-textlenspace;
	var capacityLeft = maxCharLen-(plainTextData.length);
	
	document.getElementById("hidingText").maxLength = ""+maxCharLen;
	
	if(capacityLeft>=0)
	{
		document.getElementById('charStorageLeft').innerHTML = (capacityLeft)+ " characters storage left.";
	}
	else
	{
		document.getElementById("hidingText").value=document.getElementById("hidingText").value.substring(0,maxCharLen);
		document.getElementById('charStorageLeft').innerHTML = "Over the image characters storage capacity. Message truncated. ";
	}
	return capacityLeft;
}

document.getElementById('hidingText').onchange=(function () {
	checkImageCapacity();
});

document.getElementById('hidingText').onkeyup = function () {
	checkImageCapacity();
};

function calculateCapacityBytes(coverImgData)
{
	var capacityBytes=0;
	if(_utf8mode==8)
		capacityBytes= (coverImgData.data.length - Math.floor(coverImgData.data.length/4))/4;
	else if(_utf8mode==16)
		capacityBytes= Math.floor((coverImgData.data.length - Math.floor(coverImgData.data.length/4))/8);
	return capacityBytes;
}

document.getElementById('coverImage').onchange = function() {
    
	var coverImage = document.getElementById('coverImage');
	var file = coverImage.files[ 0 ];
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
			
			document.getElementById('coverCanvas').width = this.width;
			document.getElementById('coverCanvas').height = this.height;
			
			document.getElementById('secretCanvas').width = this.width;
			document.getElementById('secretCanvas').height = this.height;			
			
			var canvas = document.getElementById('coverCanvas');
			var ctx = canvas.getContext( '2d' )
            ctx.drawImage( img, 0, 0 );

			_coverImgData = ctx.getImageData( 0, 0, canvas.width, canvas.height );
			
			_capacityBytes=calculateCapacityBytes(_coverImgData);
			
			checkImageCapacity();
			document.getElementById("hidingSuccess").style.display = "none";
		}
        img.src = e.target.result;		
	}
	
	fr.readAsDataURL( file );

}

document.getElementById('cb_utf8_16').onchange=(function (){
    if(this.checked) {
        _utf8mode=16;
		_capacityBytes=calculateCapacityBytes(_coverImgData);
    }
	else{
		_utf8mode=8;
		_capacityBytes=calculateCapacityBytes(_coverImgData);
	}
	
	checkImageCapacity();
});

function resetOperation()
{
	document.getElementById("coverCanvas").width = 0;
	document.getElementById("coverCanvas").height = 0;
	document.getElementById("secretCanvas").width = 0;
	document.getElementById("secretCanvas").height = 0;	
	document.getElementById("decodedCanvas").width = 0;
	document.getElementById("decodedCanvas").height = 0;		
	
	document.getElementById("coverImage").value = "";
	document.getElementById("hidingTextFile").value = "";
	document.getElementById("loadFile").value = "";
	
	document.getElementById("hidingText").value = "";
	document.getElementById("decodedText").value = "";	
	
	document.getElementById("hidingSuccess").style.display = "none";
	document.getElementById("decodeSuccess").style.display = "none";
}

