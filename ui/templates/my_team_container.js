if (!!!templates) var templates = {};
templates["my_team_container"] = new Hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class=\"row team-container blue-text\">");t.b("\n" + i);t.b(t.rp("<hero_input_container0",c,p,"    "));t.b(t.rp("<hero_input_container1",c,p,"    "));t.b(t.rp("<hero_input_container2",c,p,"    "));t.b(t.rp("<hero_input_container3",c,p,"    "));t.b("</div>");return t.fl(); },partials: {"<hero_input_container0":{name:"hero_input_container", partials: {}, subs: {  }},"<hero_input_container1":{name:"hero_input_container", partials: {}, subs: {  }},"<hero_input_container2":{name:"hero_input_container", partials: {}, subs: {  }},"<hero_input_container3":{name:"hero_input_container", partials: {}, subs: {  }}}, subs: {  }});