$(function () {

    var stateNames = new Array();
	var stateValues = new Array();
    var stateURLs = new Array();
    var stateModes = new Array();
    var stateColors = new Array();
    var stateOverColors = new Array();
    var stateClickedColors = new Array();
    var stateText = new Array();

    var offColor;
    var strokeColor;
    var mapWidth;
    var mapHeight;
    var useSideText;
    var textAreaWidth;
    var textAreaPadding;

    var mouseX = 0;
    var mouseY = 0;
    var current = null;

    // Detect if the browser is IE.
    var IE = $.browser.msie ? true : false;

    $.ajax({
        type: 'GET',
        url: 'xml/denmark_svg.xml',
        dataType: $.browser.msie ? 'text' : 'xml',
        success: function (data) {


            var xml;
            if ($.browser.msie) {
                xml = new ActiveXObject('Microsoft.XMLDOM');
                xml.async = false;
                xml.loadXML(data);
            } else {
                xml = data;
            }

            var $xml = $(xml);

            offColor = '#' + $xml.find('mapSettings').attr('offColor');
            strokeColor = '#' + $xml.find('mapSettings').attr('strokeColor');
            mapWidth = $xml.find('mapSettings').attr('mapWidth');
            mapHeight = $xml.find('mapSettings').attr('mapHeight');
            useSideText = $xml.find('mapSettings').attr('useSideText');
            textAreaWidth = $xml.find('mapSettings').attr('textAreaWidth');
            textAreaPadding = $xml.find('mapSettings').attr('textAreaPadding');


            if (useSideText == 'true') {
                $("#text").css({
                    'width': (parseFloat(textAreaWidth) - parseFloat(textAreaPadding * 2)) + 'px',
                    'height': (parseFloat(mapHeight) - parseFloat(textAreaPadding * 2)) + 'px',
                    'display': 'inline',
                    'float': 'right',
                    'padding': textAreaPadding + 'px'
                });

                $('#text').html($xml.find('defaultSideText').text());
            }


            //Parse xml
            $xml.find('stateData').each(function (i) {

                var $node = $(this);

                stateText.push($node.text());
                stateNames.push($node.attr('stateName'));
				stateValues.push($node.attr('stateValue'));
                stateURLs.push($node.attr('url'));
                stateModes.push($node.attr('stateMode'));
                stateColors.push('#' + $node.attr('initialStateColor'));
                stateOverColors.push('#' + $node.attr('stateOverColor'));
                stateClickedColors.push('#' + $node.attr('stateSelectedColor'));

            });

            createMap();

        }
    });


    function createMap() {

        //start map
        var r = new ScaleRaphael('map', 540, 650),
            attributes = {
                fill: '#d9d9d9',
                cursor: 'pointer',
                stroke: strokeColor,
                'stroke-width': 1,
                'stroke-linejoin': 'round'
            },
            arr = new Array();

        for (var state in mappaths) {

            //Create obj
            var obj = r.path(mappaths[state].path);
            obj.attr(attributes);
            arr[obj.id] = state;

            if (stateModes[obj.id] == 'OFF') {
                obj.attr({
                    fill: offColor,
                    cursor: 'default'
                });
            } else {

                obj.attr({
                    fill: stateColors[obj.id]
                });
				
                if(state != 'Outlines'){
					
					obj.mouseover(function (e) {
	
						//Animate if not already the current state
						if (this != current) {
							this.animate({
								fill: stateOverColors[this.id]
							}, 500);
						}
	
						//tooltip
						var point = this.getBBox(0);
						$('#map').next('.point').remove();
						$('#map').after($('<div />').addClass('point'));
						$('.point').html(stateNames[this.id]+ "<br/>"  + "<span style=font-weight:normal>" + stateValues[this.id] + "</span>").css({
							left: mouseX - 50,
							top: mouseY - 70
						}).fadeIn();
					});
	
	
					obj.mouseout(function (e) {
						if (this != current) {
							this.animate({
								fill: stateColors[this.id]
							}, 500);
						}
						$('#map').next('.point').remove();
	
					});
	
					obj.mouseup(function (e) {
	
						//Reset scrollbar
						var t = $('#text')[0];
						t.scrollLeft = 0;
						t.scrollTop = 0;
	
						//Animate previous state out
						if (current) {
							current.animate({
								fill: stateColors[current.id]
							}, 500);
						}
	
						//Animate next
						this.animate({
							fill: stateClickedColors[this.id]
						}, 500);
	
						current = this;
	
					});
				
				}
				else{
				   obj.attr({
                    cursor: 'default',
                    stroke: '#000000'
                   });	
				}//end if statement

            }

        }

        resizeMap(r);
    }



    // Set up for mouse capture
    if (document.captureEvents && Event.MOUSEMOVE) {
        document.captureEvents(Event.MOUSEMOVE);
    }

    // Main function to retrieve mouse x-y pos.s

    function getMouseXY(e) {
		
        var scrollTop = $(window).scrollTop();

        if (e && e.pageX) {
            mouseX = e.pageX;
            mouseY = e.pageY-scrollTop;
        } else {
            mouseX = event.clientX + document.body.scrollLeft;
            mouseY = event.clientY + document.body.scrollTop;
        }
        // catch possible negative values
        if (mouseX < 0) {
            mouseX = 0;
        }
        if (mouseY < 0) {
            mouseY = 0;
        }

        $('#map').next('.point').css({
            left: mouseX - 50,
            top: mouseY - 70
        })
    }

    // Set-up to use getMouseXY function onMouseMove
    document.body.onmousemove = getMouseXY;


    function resizeMap(paper) {

        paper.changeSize(mapWidth, mapHeight, true, false);

        if (useSideText == 'true') {
            $(".mapWrapper").css({
                'width': (parseFloat(mapWidth, 10) + parseFloat(textAreaWidth, 10)) + 'px',
                'height': mapHeight + 'px'
            });
        } else {
            $(".mapWrapper").css({
                'width': mapWidth + 'px',
                'height': mapHeight + 'px'
            });
        }

    }



});