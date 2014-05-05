/*
BeautifyJson v0.2.1

Copyright 2013, 2014, Tomas Thelander
Licensed under the GNU General Public License

http://dev.tthe.se/bjson

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

(function($) {
    $.fn.BeautifyJson = function(input) {
        if (this.length == 0) return;
        
        if (typeof input == 'object' || input == null)
        {
            var options = $.extend({
                'indent' : 30,
                'hover' : false,
                'links' : true,
                'pre' : false,
                'write' : true,
                'wrapper' : '%bjson%',
                'placeholder' : '%bjson%'
            },input);
            
            var level = 0;
            
            /* Recursive printing function */
            var print = function(obj, comma)
            {
                /* Print [arrays] */ 
                if (Object.prototype.toString.call(obj) === '[object Array]')
                {
                    var string = '<div class="bjson-inline">[</div>'+"\n";
                    
                    level++;
                    for (i = 0; i < obj.length; i++)
                    {
                        if (i == obj.length-1) appendComma = false;
                        else appendComma = true;
                        
                        string += Array(level+1).join("\t")+'<div class="bjson-indent" style="margin-left:'+options.indent+'px;"><span class="bjson-bg">'+ print(obj[i], appendComma) +'</span></div>';
                    }
                    level--;
                    string += Array(level+1).join("\t")+'<div style="margin-left: 0px;" class="bjson-inline">]</div>';
                    
                    if (comma)
                    {
                        string += ',';
                    }
                    
                    return string+"\n";
                }
                /* Print {objects} */
                else if (typeof obj == 'object' && obj != null)
                {
                    var string = '<div class="bjson-inline">{</div>'+"\n";
                    
                    var count = 0;
                    for (var name in obj)
                    {
                        if (obj.hasOwnProperty(name))
                        {
                            count++;
                        }
                    }
                    
                    var i = 1;
                    level++;
                    for (var name in obj)
                    {
                        if (obj.hasOwnProperty(name))
                        {
                            if (count == i) appendComma = false;
                            else appendComma = true;
                            
                            string += Array(level+1).join("\t")+'<div class="bjson-indent" style="margin-left:'+options.indent+'px;"><span class="bjson-bg"><span class="bjson-property">"'+ name +'"</span> : '+ print(obj[name], appendComma) +'</span></div>';
                        }
                        
                        i++;
                    }
                    level--;
                    
                    string += Array(level+1).join("\t")+'<div style="margin-left:0px;" class="bjson-inline">}</div>';
                    
                    if (comma) string += ',';
                    
                    return string+"\n";
                }
                /* Print "strings" */
                else if (typeof obj == 'string')
                {
                    var patternFirst = new RegExp('^https?:\\/\\/');
                    var patternFull = new RegExp('^(https?:\\/\\/)?'+ // protocol
                    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
                    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
                    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
                    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
                    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
                    
                    if (!options.links)
                    {
                        return '<span class="bjson-string">"'+ obj +'"</span>' + (comma ? ',' : '')+"\n";
                    }
                    /* Test if the string is a http(s) link */
                    else
                    {
                        /* The use of two regexp is for performance, so that not all string has to be checked against the complex patterFull */
                        if (obj.match(patternFirst))
                        {
                            if (obj.match(patternFull))
                            {
                                /* Print <a>links</a> */
                                return '<span class="bjson-string">"<a href="'+ obj +'">'+ obj +'</a>"</span>' + (comma ? ',' : '')+"\n";
                            }
                        }
                        return '<span class="bjson-string">"'+ obj +'"</span>' + (comma ? ',' : '')+"\n";
                    }
                }
                
                /* Print numbers */
                else if (typeof obj == 'number')
                {
                    return '<span class="bjson-number">' + obj.toString() + '</span>' + (comma ? ',' : '')+"\n";
                }
                /* Print booleans */
                else if (typeof obj == 'boolean')
                {
                    return '<span class="bjson-boolean">' + obj.toString() + '</span>' + (comma ? ',' : '')+"\n";
                }
                /* Print null */
                else if (typeof obj == 'object' && obj == null)
                {
                    return '<span class="bjson-null">null</span>' + (comma ? ',' : '')+"\n";
                }
                /* Unknown type */
                else
                {
                    return 'undefined' + (comma ? ',' : '')+"\n";
                }
                
            };
            
            this.each(function(i, e){
                var plaintext = $(e).text();
                
                if ($(e).data().pre)
                {
                    $(e).removeClass('bjson-pre');
                    $(e).data('pre',false);
                }
                
                try {
                    var json = JSON.parse(plaintext);
                }
                catch(err) {
                    $(e).html('Error parsing JSON.').addClass('bjson-container').css('color','red');
                    return;
                }
                
                var firstwrapper = options.wrapper.substr(0,options.wrapper.indexOf(options.placeholder));
                var lastwrapper = options.wrapper.substr(options.wrapper.indexOf(options.placeholder) + options.placeholder.length);
                var styledJson = print(json);
                
                if (options.write)
                {
                    $(e).html('<span class="bjson-bg"></span>').addClass('bjson-container');
                    $(e).find('.bjson-bg').append('<span class="bjson-wrapper">'+ firstwrapper +'</span>' + styledJson + '<span class="bjson-wrapper">'+ lastwrapper +'</span>');
                }
                
                $(e).data('bjsonPre',styledJson.replace(/(<([^>]+)>)/ig,""));
                $(e).data('bjsonObj',json);
                
                if (options.hover)
                {
                    $(e).find('.bjson-bg').mouseover(function(ev){
                        ev.stopPropagation();
                        $(e).find('.bjson-bg').removeClass('bjson-indenthover');
                        $(this).addClass('bjson-indenthover');
                    }).mouseleave(function(ev){
                        ev.stopPropagation();
                        $(this).removeClass('bjson-indenthover');
                    });
                }
                
                if (options.pre && options.write)
                {
                    $(e).BeautifyJson('pre');
                }
            });
        }
        else if (input == 'pre')
        {
            this.each(function(i,e){
                $(e).html($(e).data('bjsonPre')).addClass('bjson-pre');
                $(e).data('pre',true);
            });
        }
        
        return this;
    };
})(jQuery);