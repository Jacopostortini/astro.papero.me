(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["home"],{"924d":function(e,t,n){},9499:function(e,t,n){e.exports=n.p+"img/arrow-back.9de89f92.png"},bb51:function(e,t,n){"use strict";n.r(t);var o=n("7a23"),c=n("f773"),a=n.n(c),i=n("9499"),r=n.n(i),u=Object(o["G"])("data-v-6d33df09");Object(o["t"])("data-v-6d33df09");var s={class:"wrapper"},p={class:"home"},h=Object(o["h"])("img",{src:a.a},null,-1),m={key:0,class:"buttons-container"};Object(o["r"])();var l=u((function(e,t,c,a,i,u){var l=Object(o["x"])("UserHamburgerMenu");return Object(o["q"])(),Object(o["e"])("div",s,[Object(o["h"])(l,{show:i.showHamburgerMenu,src:n("c749"),onToggleShow:t[1]||(t[1]=function(e){return i.showHamburgerMenu=e})},null,8,["show","src"]),Object(o["h"])("div",p,[h,null===i.choice?(Object(o["q"])(),Object(o["e"])("div",m,[Object(o["h"])("button",{onClick:t[2]||(t[2]=function(e){return i.choice="join"})},Object(o["A"])(i.strings.homeView.joinGameButton),1),Object(o["h"])("button",{onClick:t[3]||(t[3]=function(e){return i.choice="create"})},Object(o["A"])(i.strings.homeView.createGameButton),1)])):Object(o["f"])("",!0),null!==i.choice?(Object(o["q"])(),Object(o["e"])("form",{key:1,onSubmit:t[6]||(t[6]=Object(o["F"])((function(){return u.play&&u.play.apply(u,arguments)}),["prevent"]))},[Object(o["h"])("img",{onClick:t[4]||(t[4]=function(e){return i.choice=null}),src:r.a}),Object(o["E"])(Object(o["h"])("input",{placeholder:i.strings.homeView.joinGameInputPlaceholder,"onUpdate:modelValue":t[5]||(t[5]=function(e){return i.input=e}),required:""},null,8,["placeholder"]),[[o["C"],i.input]]),Object(o["h"])("button",null,Object(o["A"])(i.strings.homeView.play),1)],32)):Object(o["f"])("",!0)]),i.showPopup?(Object(o["q"])(),Object(o["e"])("div",{key:0,class:"popup-background",onClick:t[9]||(t[9]=function(e){return i.showPopup=!1})},[Object(o["h"])("div",null,[Object(o["h"])("p",null,Object(o["A"])(i.popupMessage),1),Object(o["h"])("div",null,[Object(o["h"])("button",{onClick:t[7]||(t[7]=function(){return u.confirm&&u.confirm.apply(u,arguments)})},Object(o["A"])(i.confirmButton),1),Object(o["h"])("button",{onClick:t[8]||(t[8]=function(e){return i.showPopup=!1})},Object(o["A"])(i.strings.homeView.cancelButton),1)])])])):Object(o["f"])("",!0)])})),d=n("e6fd"),b=n("5d86"),f=n("bc3a"),g=n.n(f),j=n("4360"),O={name:"Game",components:{UserHamburgerMenu:b["a"]},data:function(){return{strings:d["d"],showHamburgerMenu:!1,showPopup:!1,popupMessage:"",input:"",choice:null,confirmButton:""}},methods:{play:function(){var e=this;g.a.get(d["e"].getGameStatusUrl,{params:{gameId:this.input.toLowerCase()}}).then((function(t){t.data?"join"===e.choice?e.$router.push({name:"Game",params:{gameId:e.input}}):"create"===e.choice&&(e.popupMessage=d["d"].homeView.gameAlreadyExists,e.confirmButton=d["d"].homeView.joinGameButton,e.showPopup=!0):"join"===e.choice?(e.popupMessage=d["d"].homeView.gameDoesNotExists,e.confirmButton=d["d"].homeView.createGameButton,e.showPopup=!0):"create"===e.choice&&e.$router.push({name:"Game",params:{gameId:e.input}})}))},confirm:function(){this.$router.push({name:"Game",params:{gameId:this.input}})}},beforeRouteEnter:function(e,t,n){-1===j["a"].state.logged||""===j["a"].state.username?g.a.get(d["e"].getLoginInfoUrl).then((function(e){e.data?(j["a"].dispatch("setLogged",e.data.google_signed_in),j["a"].dispatch("setUsername",e.data.username),n()):(j["a"].dispatch("setLogged",!1),j["a"].dispatch("setUsername",null),n())})).catch((function(){location.href=location.origin+"/error?from="+location.pathname})):n()}};n("cd87");O.render=l,O.__scopeId="data-v-6d33df09";t["default"]=O},cd87:function(e,t,n){"use strict";n("924d")},f773:function(e,t,n){e.exports=n.p+"img/title.603f09fc.png"}}]);
//# sourceMappingURL=home.b3670c90.js.map