if (!!!templates) var templates = {};
templates["heroes_table"] = new Hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<ul class=\"collection heroes-collection heroes-container\">");t.b("\n" + i);if(t.s(t.f("heroes",c,p,1),c,p,0,72,297,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("  <li class=\"collection-item avatar\">");t.b("\n" + i);t.b("   <img src=\"ui/images/heroes/");t.b(t.v(t.f("imageName",c,p,0)));t.b(".png\" alt=\"\" class=\"circle\">");t.b("\n" + i);t.b("   <span class=\"title\">");t.b(t.v(t.f("name",c,p,0)));t.b("</span>");t.b("\n" + i);t.b("   <p>");t.b(t.v(t.f("gamesPlayed",c,p,0)));t.b(" games won.<br>");t.b("\n" + i);t.b("      ");t.b(t.v(t.f("winPercent",c,p,0)));t.b("\n" + i);t.b("   </p>");t.b("\n" + i);t.b(" </li>");t.b("\n" + i);});c.pop();}t.b("  ");if(!t.s(t.f("heroes",c,p,1),c,p,1,0,0,"")){t.b("No Heroes Found :(");};t.b("\n" + i);t.b("</ul>");return t.fl(); },partials: {}, subs: {  }});