var We=Object.defineProperty,Se=Object.defineProperties;var $e=Object.getOwnPropertyDescriptors;var P=Object.getOwnPropertySymbols;var re=Object.prototype.hasOwnProperty,le=Object.prototype.propertyIsEnumerable;var oe=(e,t,s)=>t in e?We(e,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):e[t]=s,A=(e,t)=>{for(var s in t||(t={}))re.call(t,s)&&oe(e,s,t[s]);if(P)for(var s of P(t))le.call(t,s)&&oe(e,s,t[s]);return e},R=(e,t)=>Se(e,$e(t));var U=(e,t)=>{var s={};for(var o in e)re.call(e,o)&&t.indexOf(o)<0&&(s[o]=e[o]);if(e!=null&&P)for(var o of P(e))t.indexOf(o)<0&&le.call(e,o)&&(s[o]=e[o]);return s};import{d as O,o as m,c as M,a as p,t as g,n as ue,i as Ce,r as L,s as X,b as Z,e as Y,u as c,f as I,g as Ie,h as b,j as Ee,k as C,l as fe,m as J,p as E,q as he,w as Q,v as Oe,x as ve,y as ee,z as te,A as _e,B as Fe,C as ye,F as W,D as S,E as N,G as j,H as V,I as ne,J as pe,K as me,L as Be,M as Ae,N as Le,T as He,O as Ne,P as Ye,Q as Te}from"./vendor.bb9f4b3e.js";const Pe=function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))o(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const v of a.addedNodes)v.tagName==="LINK"&&v.rel==="modulepreload"&&o(v)}).observe(document,{childList:!0,subtree:!0});function s(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerpolicy&&(a.referrerPolicy=n.referrerpolicy),n.crossorigin==="use-credentials"?a.credentials="include":n.crossorigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function o(n){if(n.ep)return;n.ep=!0;const a=s(n);fetch(n.href,a)}};Pe();var F=(e,t)=>{const s=e.__vccOpts||e;for(const[o,n]of t)s[o]=n;return s};const Re=["disabled"],je=O({props:{day:{type:Object,required:!0}},emits:{click:null,mouseover:null,mouseleave:null},setup(e){const t=e;return(s,o)=>(m(),M("div",{class:"wrap",onMouseover:o[1]||(o[1]=n=>s.$emit("mouseover")),onMouseleave:o[2]||(o[2]=n=>s.$emit("mouseleave"))},[p("button",{class:ue(["calendar-cell",{light:t.day.otherMonth,active:t.day.isSelected.value,hover:t.day.isHovered.value,between:t.day.isBetween.value,today:t.day.isToday,red:t.day._copied}]),disabled:t.day.disabled.value,onClick:o[0]||(o[0]=n=>s.$emit("click"))},g(t.day.date.getDate()),11,Re)],32))}});var H=F(je,[["__scopeId","data-v-27c9c2bc"]]);function De(e){const t=e||(s=>s);return function(...s){const o=new Date(...s),n=o.getDay();return t({date:o,isToday:Ce(o),isWeekend:n===0||n>6,otherMonth:!1,disabled:L(!1),isSelected:L(!1),isBetween:L(!1),isHovered:L(!1),monthYearIndex:ke(o),dayId:[o.getFullYear(),o.getMonth(),o.getDate()].join("-"),_copied:!1})}}function ce(e){return R(A({},e),{_copied:!0})}function ke(e,t){return typeof e=="number"?e*12+(t||0):e.getFullYear()*12+e.getMonth()}function Ve(e){return Math.floor(e/12)}function qe(e){return e%12}const Ge={class:"legend"},Ke=I(" Today cell "),Ue=I(" Other month cell "),Je=I(" Other month cell linked to another cell "),Qe=O({setup(e){const t=De(),s=new Date(2022,4,15),o=t(s);o.isToday=!0;const n=t(X(Z(s,1)));n.otherMonth=!0;const a=t(n.date);return a.otherMonth=!0,a._copied=!0,(v,f)=>(m(),M("div",Ge,[p("label",null,[Y(H,{day:c(o)},null,8,["day"]),Ke]),p("label",null,[Y(H,{day:c(n)},null,8,["day"]),Ue]),p("label",null,[Y(H,{day:c(a)},null,8,["day"]),Je])]))}});var ze=F(Qe,[["__scopeId","data-v-2e00803e"]]);function Xe({firstDayOfWeek:e,locale:t}){return(s="iiiii")=>{const o=Ie(new Date),n=Array.from(Array(7).keys()).map(a=>b(o,a));return Array.from(Array(e)).forEach(()=>{n.push(n.shift())}),n.map(a=>Ee(a,s,{locale:t}))}}function Me(e){function t(s,o){var v;s.setHours(0,0,0,0),o.setHours(0,0,0,0);const n=[e.factory(s)];let a=s.getDate()+1;for(fe(s,o);J(((v=n[n.length-1])==null?void 0:v.date)||0,o);){const f=e.factory(s.getFullYear(),s.getMonth(),a++);f.disabled.value=e.disabled.some(l=>C(f.date,l)),n.push(f)}return n}return{generateConsecutiveDays:t}}function ie(e,t,s){const o=e.findIndex(f=>C(f.date,t.date)),n=e.findIndex(f=>C(f.date,s.date)),[a,v]=[o,n].sort((f,l)=>f-l);return e.slice(a+1,v)}function z(e,t,s){const o=t?e.slice(0,e.findIndex(a=>C(a.date,t))):[],n=s?e.slice(e.findIndex(a=>C(a.date,s))):[];[...o,...n].forEach(a=>{a.disabled.value=!0})}function Ze(e,t=7){return Array(Math.ceil(e.length/t)).fill(null).map((s,o)=>e.slice(o*t,o*t+t))}function ge(e){const t=E(()=>e.value.filter(a=>!a._copied)),s=E(()=>t.value.filter(a=>a.isSelected.value)),o=E(()=>t.value.filter(a=>a.isHovered.value)),n=E(()=>t.value.filter(a=>a.isBetween.value));return{pureDates:t,selectedDates:s,hoveredDates:o,betweenDates:n}}function we(e,t,s,o){const n=he([]);Q(n,()=>{if(e.value.forEach(r=>{r.isSelected.value=n.some(i=>C(i,r.date))}),n.length>=2){const r=J(n[0],n[1]),i=J(e.value[0].date,n[r?0:1])?null:e.value[0],h=fe(e.value[e.value.length-1].date,n[r?1:0])?null:e.value[e.value.length-1],d=e.value.find(D=>C(D.date,n[0]))||(r?i:e.value[e.value.length-1]),u=e.value.find(D=>C(D.date,n[1]))||(r?h:i);d&&u&&ie(e.value,d,u).forEach(D=>{D.isBetween.value=!0})}else s.value.forEach(r=>{r.isBetween.value=!1})});function a(r){const i=n.findIndex(h=>C(r.date,h));i>=0?n.splice(i,1):n.push(r.date)}function v(r){const i=e.value.find(h=>C(h.date,n[0]));i&&a(i),a(r)}function f(r){n.length>=2&&!r.isSelected.value&&n.splice(0),r.isSelected.value=!r.isSelected.value,a(r)}function l(r){r.isSelected.value=!r.isSelected.value,a(r)}function _(r){if(t.value.length!==1)return;o.value.forEach(h=>{h.isHovered.value=!1}),ie(e.value,t.value[0],r).forEach(h=>{h.isHovered.value=!0}),r.isHovered.value=!0}function y(){o.value.forEach(r=>{r.isHovered.value=!1})}return{selection:n,selectSingle:v,selectRange:f,selectMultiple:l,hoverMultiple:_,resetHover:y}}function xe(e,t,s=!1){const o=L(0),n=E(()=>e[o.value]),a=E(()=>s||o.value>0),v=E(()=>s||o.value<e.length-1);function f(){_(n.value.index+1)}function l(){_(n.value.index-1)}function _(y){if(y===n.value.index)return;let r=e.findIndex(i=>i.index===y);if(s&&r<0){const i=t(y,n);y===e[0].index-1?(e.unshift(i),r=0):y===e[e.length-1].index+1?(e.push(i),r=e.length-1):(e.splice(0,e.length,i),r=0)}o.value=Math.max(0,r)}return{jumpTo:_,nextWrapper:f,prevWrapper:l,prevWrapperEnabled:a,nextWrapperEnabled:v,currentWrapper:n}}function et(e){const{generateConsecutiveDays:t}=Me(e);function s(l){return{days:l,month:l[10].date.getMonth(),year:l[10].date.getFullYear(),index:l[10].monthYearIndex}}function o(l,_=!1){const y=[...new Set(l.map(i=>i.monthYearIndex))],r=Oe([]);return y.forEach(i=>{var w;const h=l.findIndex(k=>k.monthYearIndex===i),d=l.findIndex(k=>k.monthYearIndex===i+1),u=d>=0?d:l.length,D=l.slice(h,u);if(_){const k=((w=r[r.length-1])==null?void 0:w.days)||[];a(D,k,[])}r.push(s(D))}),r}function n(l,_){const{otherMonthsDays:y=!1,beforeMonthDays:r=[],afterMonthDays:i=[]}=_,h=new Date(Ve(l),qe(l)),d=t(X(h),ve(h));return y&&a(d,r,i),s(d)}function a(l,_,y){l.length<=0||(v(l,_),f(l,y))}function v(l,_){let y=[];if(_.length>0){const r=_.slice(-7),i=r.map(ce);r.forEach(d=>{d._copied=d.otherMonth}),i.forEach(d=>{d.otherMonth=!d.otherMonth,d._copied=d.otherMonth});const h=(7-l[0].date.getDay()+e.firstDayOfWeek)%7;h>0&&(y=i,l.splice(0,h))}else{const r=l[0].date,i=ee(r,{weekStartsOn:e.firstDayOfWeek});y=t(i,r).slice(0,-1),y.forEach(h=>{h.otherMonth=!0})}l.unshift(...y)}function f(l,_){let y=[];if(_.length>0){const r=_.slice(0,7),i=r.map(ce);r.forEach(d=>{d._copied=d.otherMonth}),i.forEach(d=>{d.otherMonth=!d.otherMonth,d._copied=d.otherMonth});const h=(l[l.length-1].date.getDay()-e.firstDayOfWeek+1)%7;h>0&&(y=i,l.splice(-h,h))}else{const r=l[l.length-1],i=te(r.date,{weekStartsOn:e.firstDayOfWeek});y=t(r.date,i).slice(1),y.forEach(h=>{h.otherMonth=!0})}l.push(...y)}return{generateConsecutiveDays:t,generateMonth:n,wrapByMonth:o}}function tt(e){const{generateConsecutiveDays:t,generateMonth:s,wrapByMonth:o}=et(e);return function(a={}){const{infinite:v=!0,fullWeeks:f=!0}=a,l=t(X(e.startOn),ve(e.maxDate||e.startOn)),_=o(l,f),{currentWrapper:y,jumpTo:r,nextWrapper:i,prevWrapper:h,prevWrapperEnabled:d,nextWrapperEnabled:u}=xe(_,(x,T)=>{var ae,se;const be=s(x,{otherMonthsDays:!!f,beforeMonthDays:((ae=_.find(K=>K.index===x-1))==null?void 0:ae.days)||[],afterMonthDays:((se=_.find(K=>K.index===x+1))==null?void 0:se.days)||[]});return $.splice(0,$.length,...$.reverse()),be},v),D=he({month:e.startOn.getMonth(),year:e.startOn.getFullYear()});Q(y,x=>{D.month===x.month&&D.year===x.year||(D.month=x.month,D.year=x.year)}),Q(D,x=>{x.month=Math.min(11,x.month);const T=ke(D.year,D.month);r(T)});const w=E(()=>_.flatMap(x=>x.days).filter(Boolean)),k=ge(w);_e(()=>{z(w.value,e.minDate,e.maxDate)});const G=we(k.pureDates,k.selectedDates,k.betweenDates,k.hoveredDates),{selection:$}=G,B=U(G,["selection"]);return{currentMonth:y,currentMonthAndYear:D,months:_,days:w,nextMonth:i,prevMonth:h,prevMonthEnabled:d,nextMonthEnabled:u,selectedDates:$,listeners:B}}}function nt(e){const{generateConsecutiveDays:t}=Me(e);function s(a){const v=f=>Fe(f.date,{weekStartsOn:e.firstDayOfWeek});return{days:a,weekNumber:v(a[0]),month:a[0].date.getMonth(),year:a[0].date.getFullYear(),index:parseInt(a[0].date.getFullYear().toString()+v(a[0]).toString().padStart(2,"0"),10)}}function o(a){const v=a.findIndex(l=>l.date.getDay()===e.firstDayOfWeek);return[a.slice(0,v),...Ze(a.slice(v),7)].filter(l=>l.length>0).map(s)}function n(a,v){const f=new Date(a.year,0,a.weekNumber*7),l=t(ee(f),te(f));return s(l)}return{generateConsecutiveDays:t,generateWeek:n,wrapByWeek:o}}const at={infinite:!1};function st(e){const{generateConsecutiveDays:t,wrapByWeek:s,generateWeek:o}=nt(e);return function(a){const{infinite:v}=A(A({},at),a),f=t(ee(e.startOn,{weekStartsOn:e.firstDayOfWeek}),te(e.maxDate||e.startOn,{weekStartsOn:e.firstDayOfWeek}));z(f,e.minDate,e.maxDate);const l=s(f),_=E(()=>l.flatMap(B=>B.days));_e(()=>{z(f,e.minDate,e.maxDate)});const y=L(0),{currentWrapper:r,nextWrapper:i,prevWrapper:h,prevWrapperEnabled:d,nextWrapperEnabled:u}=xe(l,(B,G)=>{const x=parseInt(B.toString().slice(0,4),10),T=parseInt(B.toString().slice(4),10);return o({year:x,weekNumber:T},{firstDayOfWeek:e.firstDayOfWeek})},v),D=ge(_),$=we(_,D.selectedDates,D.betweenDates,D.hoveredDates),{selection:w}=$,k=U($,["selection"]);return{currentWeek:r,currentWeekIndex:y,days:_,weeks:l,nextWeek:i,prevWeek:h,prevWeekEnabled:d,nextWeekEnabled:u,selectedDates:w,listeners:k}}}function q(e){const t=ot(e),s=tt(t),o=st(t);return{useMonthlyCalendar:s,useWeeklyCalendar:o,useWeekdays:Xe(t)}}function ot(e){var l;const t=e.minDate?new Date(e.minDate):void 0,s=e.maxDate?new Date(e.maxDate):void 0,o=e.startOn?new Date(e.startOn):t||new Date,n=((l=e.disabled)==null?void 0:l.map(_=>new Date(_)))||[],a=(Array.isArray(e.preSelection)?e.preSelection:[e.preSelection]).filter(Boolean),v=De(e.factory),f=e.firstDayOfWeek||0;return R(A({},e),{startOn:o,firstDayOfWeek:f,minDate:t,maxDate:s,disabled:n,preSelection:a,factory:v})}const rt=e=>(j("data-v-cdeb1e4a"),e=e(),V(),e),lt={class:"date-picker"},ct=rt(()=>p("h2",null,"Date picker example",-1)),it={key:0},dt={class:"weeknames grid"},ut={class:"grid"},ft=O({setup(e){const t=[b(new Date,3)],s=[b(new Date,5)],o=1,{useMonthlyCalendar:n,useWeekdays:a}=q({minDate:new Date,maxDate:Z(new Date,2),disabled:t,firstDayOfWeek:o,preSelection:s}),{months:v,currentMonth:f,listeners:l,selectedDates:_}=n(),y=a();return(r,i)=>{var h,d;return m(),M("div",lt,[ct,c(_).length>0?(m(),M("div",it," Selection: "+g((d=(h=c(_))==null?void 0:h[0])==null?void 0:d.toLocaleDateString()),1)):ye("",!0),p("div",null,"Current month: "+g(c(f).month+1)+" - "+g(c(f).year),1),p("div",null,[p("div",dt,[(m(!0),M(W,null,S(c(y),u=>(m(),M("span",{key:u},g(u),1))),128))]),(m(!0),M(W,null,S(c(v),u=>(m(),M("div",{key:u.month+u.year,class:"month"},[I(g(u.month+1)+" - "+g(u.year)+" ",1),p("div",ut,[(m(!0),M(W,null,S(u.days,D=>(m(),N(H,{key:D.dayId,day:D,onClick:w=>c(l).selectSingle(D),onMouseleave:i[0]||(i[0]=w=>c(l).resetHover())},null,8,["day","onClick"]))),128))])]))),128))])])}}});var ht=F(ft,[["__scopeId","data-v-cdeb1e4a"]]);const vt=e=>(j("data-v-83ac9fb2"),e=e(),V(),e),_t={class:"calendar"},yt=vt(()=>p("h2",null,"Monthly infinite calendar picker",-1)),pt={class:"row"},mt=I(" Selection: "),Dt=["value"],kt={class:"month"},Mt={class:"actions"},gt=["disabled"],wt=["disabled"],xt={class:"weeknames grid"},bt={class:"grid"},Wt=O({setup(e){const t=[b(new Date,12)],s=1,o=Array.from(new Array(100)).map((D,w)=>1950+w),{useMonthlyCalendar:n,useWeekdays:a}=q({startOn:new Date(2023,5,12),disabled:t,firstDayOfWeek:s,locale:ne,preSelection:[new Date(2023,5,15),b(new Date(2023,5,15),6)]}),{nextMonth:v,prevMonth:f,currentMonthAndYear:l,prevMonthEnabled:_,nextMonthEnabled:y,currentMonth:r,listeners:i,selectedDates:h}=n({infinite:!0});h.splice(0,h.length,new Date(2023,5,15),b(new Date(2023,5,15),6));const d=a();function u(){const D=new Date;l.month=D.getMonth(),l.year=D.getFullYear()}return(D,w)=>(m(),M("div",_t,[yt,p("div",pt,[mt,(m(!0),M(W,null,S(c(h),k=>(m(),M("span",{key:k.getTime()},g(k.toLocaleDateString()),1))),128))]),p("button",{onClick:u},"Today"),pe(p("select",{"onUpdate:modelValue":w[0]||(w[0]=k=>c(l).year=k)},[(m(!0),M(W,null,S(c(o),k=>(m(),M("option",{key:k,value:k},g(k),9,Dt))),128))],512),[[me,c(l).year]]),p("div",kt,[p("div",Mt,[p("button",{disabled:!c(_),onClick:w[1]||(w[1]=(...k)=>c(f)&&c(f)(...k))}," - ",8,gt),I(" "+g(c(r).month+1)+" - "+g(c(r).year)+" ",1),p("button",{disabled:!c(y),onClick:w[2]||(w[2]=(...k)=>c(v)&&c(v)(...k))}," + ",8,wt)]),p("div",xt,[(m(!0),M(W,null,S(c(d),k=>(m(),M("span",{key:k},g(k),1))),128))]),p("div",bt,[(m(!0),M(W,null,S(c(r).days,k=>(m(),N(H,{key:k.dayId,day:k,onClick:$=>c(i).selectRange(k),onMouseover:$=>c(i).hoverMultiple(k),onMouseleave:w[3]||(w[3]=$=>c(i).resetHover())},null,8,["day","onClick","onMouseover"]))),128))])])]))}});var de=F(Wt,[["__scopeId","data-v-83ac9fb2"]]);const St=e=>(j("data-v-07abf8f7"),e=e(),V(),e),$t={class:"calendar"},Ct=St(()=>p("h2",null,"Weekly calendar picker",-1)),It=I(" Selection: "),Et={class:"month"},Ot={class:"actions"},Ft=["disabled"],Bt=["disabled"],At={class:"weeknames grid"},Lt={class:"grid"},Ht=O({setup(e){const t=[b(new Date,10)],s=1,{useWeeklyCalendar:o,useWeekdays:n}=q({minDate:new Date,maxDate:b(new Date,26),disabled:t,firstDayOfWeek:s,locale:ne,preSelection:[b(new Date,2)]}),{currentWeek:a,nextWeek:v,prevWeek:f,prevWeekEnabled:l,nextWeekEnabled:_,listeners:y,selectedDates:r}=o(),i=n();return(h,d)=>(m(),M("div",$t,[Ct,It,(m(!0),M(W,null,S(c(r),u=>(m(),M("span",{key:u.dayId},g(u.date.toLocaleDateString()),1))),128)),p("div",Et,[p("div",Ot,[p("button",{disabled:!c(l),onClick:d[0]||(d[0]=(...u)=>c(f)&&c(f)(...u))}," - ",8,Ft),I(" "+g(c(a).month+1)+" - "+g(c(a).year)+" W:"+g(c(a).weekNumber+1)+" ",1),p("button",{disabled:!c(_),onClick:d[1]||(d[1]=(...u)=>c(v)&&c(v)(...u))}," + ",8,Bt)]),p("div",At,[(m(!0),M(W,null,S(c(i),u=>(m(),M("span",{key:u},g(u),1))),128))]),p("div",Lt,[(m(!0),M(W,null,S(c(a).days,u=>(m(),N(H,{key:u.dayId,day:u,onClick:D=>c(y).selectSingle(u)},null,8,["day","onClick"]))),128))])])]))}});var Nt=F(Ht,[["__scopeId","data-v-07abf8f7"]]);const Yt={class:"wrap"},Tt=["disabled"],Pt={key:0,class:"price"},Rt=O({props:{day:{type:Object,required:!0}},emits:{click:null},setup(e){const t=e;return(s,o)=>(m(),M("div",Yt,[p("button",{class:ue(["calendar-cell",{light:t.day.otherMonth,active:t.day.isSelected.value,hover:t.day.isHovered.value,between:t.day.isBetween.value,today:t.day.isToday}]),disabled:t.day.disabled.value,onClick:o[0]||(o[0]=n=>s.$emit("click"))},[p("p",null,g(t.day.date.getDate()),1),t.day.price?(m(),M("p",Pt,g(t.day.price)+"\u20AC ",1)):ye("",!0)],10,Tt)]))}});var jt=F(Rt,[["__scopeId","data-v-d0527c58"]]);const Vt=e=>(j("data-v-59b5ca08"),e=e(),V(),e),qt={class:"calendar"},Gt=Vt(()=>p("h2",null,"Override with price",-1)),Kt={class:"month"},Ut={class:"actions"},Jt=["disabled"],Qt=["disabled"],zt={class:"weeknames grid"},Xt={class:"grid"},Zt=O({setup(e){const t=[b(new Date,10)],s=1,o=[{day:b(new Date,3).toLocaleDateString(),price:10},{day:b(new Date,4).toLocaleDateString(),price:99},{day:b(new Date,6).toLocaleDateString(),price:50}],{useMonthlyCalendar:n,useWeekdays:a}=q({minDate:new Date,maxDate:Z(new Date,2),disabled:t,firstDayOfWeek:s,locale:ne,preSelection:[new Date,b(new Date,6)],factory:h=>{const d=o.find(D=>D.day===h.date.toLocaleDateString());return R(A({},h),{price:(d==null?void 0:d.price)||0})}}),{nextMonth:v,prevMonth:f,prevMonthEnabled:l,nextMonthEnabled:_,currentMonth:y,listeners:r}=n({infinite:!1}),i=a();return(h,d)=>(m(),M("div",qt,[Gt,p("div",Kt,[p("span",Ut,[p("button",{disabled:!c(l),onClick:d[0]||(d[0]=(...u)=>c(f)&&c(f)(...u))}," - ",8,Jt),I(" "+g(c(y).month+1)+" - "+g(c(y).year)+" ",1),p("button",{disabled:!c(_),onClick:d[1]||(d[1]=(...u)=>c(v)&&c(v)(...u))}," + ",8,Qt)]),p("div",zt,[(m(!0),M(W,null,S(c(i),u=>(m(),M("span",{key:u},g(u),1))),128))]),p("div",Xt,[(m(!0),M(W,null,S(c(y).days,u=>(m(),N(jt,{key:u.dayId,day:u,onClick:D=>c(r).selectRange(u),onMouseover:D=>c(r).hoverMultiple(u),onMouseleave:d[2]||(d[2]=D=>c(r).resetHover())},null,8,["day","onClick","onMouseover"]))),128))])])]))}});var en=F(Zt,[["__scopeId","data-v-59b5ca08"]]);const tn={class:"column"},nn=I(" Change example: "),an=["value"],sn=O({setup(e){const t=[{name:"Simple date picker",component:ht},{name:"Classic month calendar (range)",component:de},{name:"Weekly calendar",component:Nt},{name:"Custom date object calendar",component:en}],s=Be(de);return(o,n)=>(m(),M("div",tn,[p("label",null,[nn,pe(p("select",{"onUpdate:modelValue":n[0]||(n[0]=a=>Ae(s)?s.value=a:null)},[(m(),M(W,null,S(t,a=>p("option",{key:a.name,value:a.component},g(a.name),9,an)),64))],512),[[me,c(s)]])]),Y(ze),Y(He,{name:"slide-left",mode:"out-in"},{default:Le(()=>[(m(),N(Ye,null,[(m(),N(Ne(c(s))))],1024))]),_:1})]))}});Te(sn).mount("#app");
