(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["home"],{1597:function(e,t,n){},"31b6":function(e,t,n){"use strict";n("1597")},bb51:function(e,t,n){"use strict";n.r(t);var o=n("7a23"),c=n("f773"),a=n.n(c),i=Object(o["G"])("data-v-366209fe");Object(o["t"])("data-v-366209fe");var u={class:"wrapper"},r={class:"home"},s=Object(o["h"])("img",{src:a.a},null,-1),p={key:0,class:"buttons-container"};Object(o["r"])();var h=i((function(e,t,c,a,i,h){var l=Object(o["x"])("UserHamburgerMenu");return Object(o["q"])(),Object(o["e"])("div",u,[Object(o["h"])(l,{show:i.showHamburgerMenu,src:n("c749"),onToggleShow:t[1]||(t[1]=function(e){return i.showHamburgerMenu=e})},null,8,["show","src"]),Object(o["h"])("div",r,[s,null===i.choice?(Object(o["q"])(),Object(o["e"])("div",p,[Object(o["h"])("button",{onClick:t[2]||(t[2]=function(e){return i.choice="join"})},Object(o["A"])(i.strings.homeView.joinGameButton),1),Object(o["h"])("button",{onClick:t[3]||(t[3]=function(e){return i.choice="create"})},Object(o["A"])(i.strings.homeView.createGameButton),1)])):Object(o["f"])("",!0),null!==i.choice?(Object(o["q"])(),Object(o["e"])("form",{key:1,onSubmit:t[6]||(t[6]=Object(o["F"])((function(){return h.play&&h.play.apply(h,arguments)}),["prevent"]))},[Object(o["h"])("span",{onClick:t[4]||(t[4]=function(e){return i.choice=null})},"↩"),Object(o["E"])(Object(o["h"])("input",{placeholder:i.strings.homeView.joinGameInputPlaceholder,"onUpdate:modelValue":t[5]||(t[5]=function(e){return i.input=e}),required:""},null,8,["placeholder"]),[[o["C"],i.input]]),Object(o["h"])("button",null,Object(o["A"])(i.strings.homeView.play),1)],32)):Object(o["f"])("",!0)]),i.showPopup?(Object(o["q"])(),Object(o["e"])("div",{key:0,class:"popup-background",onClick:t[9]||(t[9]=function(e){return i.showPopup=!1})},[Object(o["h"])("div",null,[Object(o["h"])("p",null,Object(o["A"])(i.popupMessage),1),Object(o["h"])("div",null,[Object(o["h"])("button",{onClick:t[7]||(t[7]=function(){return h.confirm&&h.confirm.apply(h,arguments)})},Object(o["A"])(i.confirmButton),1),Object(o["h"])("button",{onClick:t[8]||(t[8]=function(e){return i.showPopup=!1})},Object(o["A"])(i.strings.homeView.cancelButton),1)])])])):Object(o["f"])("",!0)])})),l=n("e6fd"),m=n("5d86"),b=n("bc3a"),d=n.n(b),f=n("4360"),g={name:"Game",components:{UserHamburgerMenu:m["a"]},data:function(){return{strings:l["d"],showHamburgerMenu:!1,showPopup:!1,popupMessage:"",input:"",choice:null,confirmButton:""}},methods:{play:function(){var e=this;d.a.get(l["e"].getGameStatusUrl,{params:{gameId:this.input.toLowerCase()}}).then((function(t){t.data?"join"===e.choice?e.$router.push({name:"Game",params:{gameId:e.input}}):"create"===e.choice&&(e.popupMessage=l["d"].homeView.gameAlreadyExists,e.confirmButton=l["d"].homeView.joinGameButton,e.showPopup=!0):"join"===e.choice?(e.popupMessage=l["d"].homeView.gameDoesNotExists,e.confirmButton=l["d"].homeView.createGameButton,e.showPopup=!0):"create"===e.choice&&e.$router.push({name:"Game",params:{gameId:e.input}})}))},confirm:function(){this.$router.push({name:"Game",params:{gameId:this.input}})}},beforeRouteEnter:function(e,t,n){-1===f["a"].state.logged||""===f["a"].state.username?d.a.get(l["e"].getLoginInfoUrl).then((function(e){e.data?(f["a"].dispatch("setLogged",e.data.google_signed_in),f["a"].dispatch("setUsername",e.data.username),n()):(f["a"].dispatch("setLogged",!1),f["a"].dispatch("setUsername",null),n())})).catch((function(){location.href=location.origin+"/error?from="+location.pathname})):n()}};n("31b6");g.render=h,g.__scopeId="data-v-366209fe";t["default"]=g},f773:function(e,t,n){e.exports=n.p+"img/title.603f09fc.png"}}]);
//# sourceMappingURL=home.ae739385.js.map