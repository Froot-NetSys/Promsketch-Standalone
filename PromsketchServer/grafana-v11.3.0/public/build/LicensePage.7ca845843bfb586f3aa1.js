"use strict";(self.webpackChunkgrafana=self.webpackChunkgrafana||[]).push([[6125,5356,9299],{96713:(J,b,t)=>{t.r(b),t.d(b,{LicensePage:()=>re,default:()=>Se});var e=t(74848),c=t(96540),j=t(32264),L=t(21780),A=t(16233),E=t(51372),N=t(13680),o=t(32196),P=t(72724),T=t(39601),y=t(40845),R=t(42418),C=t(55852),S=t(14578),G=t(55356),O=t(31906);const F=({orgSlug:s,licenseId:i})=>{let d="https://grafana.com/contact";return s&&i&&(d=`https://grafana.com/orgs/${s}/tickets?support=licensing&licenseId=${i}`),(0,e.jsx)(C.z9,{href:d,target:"_blank",rel:"noopener noreferrer",children:"Contact customer support"})};var Y=t(81507),M=t(3911),Q=t(56034);const a=({title:s,children:i,footer:d,state:u,status:r,className:g})=>{const $=(0,y.$j)(),h=x($,u);return(0,e.jsx)(Y.Q,{className:(0,o.cx)(h.container,g),disableHover:!0,children:(0,e.jsxs)("div",{className:h.inner,children:[(s||r)&&(0,e.jsxs)("div",{className:h.row,children:[s&&(0,e.jsx)("h3",{className:h.title,children:s}),r&&(0,e.jsx)(n,{state:u,status:r})]}),(0,e.jsx)("div",{className:h.content,children:i}),d&&(0,e.jsx)("div",{className:h.footer,children:d})]})})},x=(0,M.N)((s,i)=>({container:(0,o.css)`
      padding: ${s.spacing(2)};
      margin-bottom: 0;
      ${i&&`border: 1px solid ${s.colors[i].border}`};
    `,inner:(0,o.css)`
      display: flex;
      flex-direction: column;
      width: 100%;
    `,title:(0,o.css)`
      font-size: ${s.typography.h3.fontSize};
      color: ${s.colors.text.secondary};
      margin-bottom: 0;
    `,row:(0,o.css)`
      display: flex;
      justify-content: space-between;
      width: 100%;
      margin-bottom: ${s.spacing(2)};
      align-items: center;
    `,content:(0,o.css)`
      display: flex;
      flex-direction: column;
      flex: 1 0 auto;
      width: 100%;
    `,footer:(0,o.css)`
      display: flex;
      flex-direction: column;
      align-items: self-start;
      margin-top: ${s.spacing(2)};
    `})),n=({state:s,status:i})=>{const d=new Map([["warning","bell"],["error","exclamation-triangle"]]),u=(0,y.$j)(),r=U(u,s);return s&&d.has(s)?(0,e.jsxs)("div",{role:"alert",className:r.container,children:[(0,e.jsx)(S.I,{name:d.get(s)}),i]}):null},U=(s,i)=>({container:(0,o.css)`
      background-color: ${s.colors.background.primary};
      color: ${i&&s.colors[i].text};
      padding: ${s.spacing(.5)} ${s.spacing(1)};

      svg {
        margin-right: ${s.spacing(1)};
      }
    `}),m=({state:s,title:i,orgSlug:d,licenseId:u})=>{const r=(0,y.of)(l);return s?(0,e.jsx)(R.F,{title:i,severity:s,className:r.container,children:(0,e.jsx)(F,{orgSlug:d,licenseId:u})}):null},l=s=>({container:(0,o.css)`
      background: ${s.colors.secondary.main};
      margin-bottom: ${s.spacing(3)};
    `}),p=({content:s,state:i})=>{const d=(0,y.$j)(),u=v(d,i);return(0,e.jsx)(e.Fragment,{children:s.map(r=>{if(!r)return null;const g={marginLeft:`${r.indentLevel||0}em`};return(0,e.jsxs)("div",{className:u.row,children:[(0,e.jsxs)("span",{style:g,children:[r.name,r.tooltip&&(0,e.jsx)(Q.m,{placement:"top",content:r.tooltip,theme:"info",children:(0,e.jsx)(S.I,{name:"info-circle",size:"sm"})})]}),(0,e.jsx)("span",{className:r.highlight?u.highlight:"",children:r.value})]},r.name)})})},v=(s,i)=>({row:(0,o.css)`
      display: flex;
      justify-content: space-between;
      width: 100%;
      margin-bottom: ${s.spacing(2)};
      align-items: center;
      svg {
        margin-left: ${s.spacing(.5)};
        cursor: pointer;
      }
    `,highlight:(0,o.css)`
      background-color: ${s.colors.background.primary};
      color: ${i&&s.colors[i].text};
      padding: ${s.spacing(.5)} ${s.spacing(1)};
      margin-right: -${s.spacing(1)};

      svg {
        margin-right: ${s.spacing(1)};
      }
    `});var z=t(73546);const D=({isUploading:s,title:i,onFileUpload:d,isDisabled:u,licensedUrl:r})=>{const g=V();return(0,e.jsxs)(e.Fragment,{children:[i&&(0,e.jsx)("h2",{className:g.title,children:i}),s?(0,e.jsx)(C.$n,{disabled:!0,children:"Uploading\u2026"}):u?(0,e.jsx)(C.$n,{disabled:!0,children:"Upload a new token"}):(0,e.jsx)(z.e,{onFileUpload:d,accept:".jwt",children:"Upload a new token"}),r&&(0,e.jsxs)("p",{className:g.instanceUrl,children:["Instance URL: ",(0,e.jsx)("code",{children:r})]})]})},V=(0,M.N)(()=>({title:(0,o.css)`
      margin-top: 30px;
      margin-bottom: 20px;
    `,instanceUrl:(0,o.css)`
      margin-top: 10px;
    `}));var f=t(23428),Z=t(73803),I=t(47232);const ge=(s,i)=>(i?`${i} of `:"")+(s>0?s:"unlimited"),pe=s=>(0,I.KQ)(s.exp*1e3)<(0,I.KQ)(),xe=s=>(0,I.KQ)(s.exp*1e3)<(0,I.KQ)().add(j.$.licensing.tokenExpiryWarnDays,"d"),te=s=>Math.ceil((s.exp-(0,I.KQ)().unix())/3600/24),K=s=>s?pe(s)?{state:"error",status:"Expired",title:"Token expired",message:"Contact support to renew your token, or visit the Cloud portal to learn more."}:xe(s)?{state:"warning",status:` Expiring in ${te(s)} day(s)`,title:"Token expires soon",message:`Your token expires in ${te(s)} day(s). Contact support to renew your token.`}:{state:"",status:"",title:"",message:""}:{state:"",status:"",title:"",message:""},he=s=>s.trial_exp&&(0,I.KQ)(s.trial_exp*1e3)<(0,I.KQ)(),ne=s=>s.trial_exp?Math.ceil((s.trial_exp-(0,I.KQ)().unix())/3600/24):0,ae=(s,i)=>{const{active_users:d=0,active_anonymous_devices:u=0}=s||{};return d+Math.floor(u/(i?.anonymousRatio||1))},me=s=>!s||!s.trial||!s.trial_exp?{state:"",status:"",title:"",message:""}:he(s)?{state:"error",status:"Expired",title:"Trial expired",message:"Your trial period has expired, please contact sales to purchase a license."}:{state:"info",status:` Trial expiring in ${ne(s)} day(s)`,title:"Trial active",message:`Your trial expires in ${ne(s)} day(s), please contact sales to purchase a license.`},ie=(s,i=0)=>100*i/s,X=(s,i)=>{let d="",u="",r="",g="";if(!s)return{state:d,status:u,title:r,message:g};if(s.limit_by===f.Bb){const $=ae(i,s),h=s.included_users;let w=0;typeof $=="number"&&(w=ie(h,$)),w>f.Qf?(d="error",u="Quota exceeded: active users",r="User limit exceeded",g=`There are more than ${h} active users using Grafana.`,g+=" Contact support to increase the quotas."):w>=f._7&&(d="warning",w>=f.Qf?(u="Limit reached",r="User utilization limit reached",g=`You are at your limit of ${h} active users.`):(u="Reaching limit",r="User utilization reaching limit",g=`There are ${$} active users.`,g+=` You are approaching your limit of ${h} active users.`),u+=": active users",g+=" Contact support to increase the quotas.")}return{state:d,status:u,title:r,message:g}},ve=({token:s,stats:i,tokenRenewed:d,tokenUpdated:u,isLoading:r,licensedUrl:g})=>{const[$,h]=(0,c.useState)(!1),[w,q]=(0,c.useState)(!1),H=K(s).state,_=X(s,i).state,ee=A.TP.hasPermission(N.AccessControlAction.LicensingWrite),W=(0,y.of)(fe),oe=ae(i,s),se=s?.anonymousRatio||1,le=B=>{const de=B.currentTarget?.files?.[0];if(de){T.Ny.partial({tokenUpdated:null,tokenRenewed:null});const ue=new FileReader,be=()=>async Le=>{h(!0);try{await(0,Z.$6)(Le.target.result),T.Ny.partial({tokenUpdated:!0}),setTimeout(()=>{location.reload()},1e3)}catch(Ae){throw h(!1),Ae}};ue.onload=be(),ue.readAsText(de)}},$e=async()=>{T.Ny.partial({tokenUpdated:null,tokenRenewed:null}),q(!0);try{await(0,Z.Sj)(),T.Ny.partial({tokenRenewed:!0}),setTimeout(()=>{location.reload()},1e3)}catch(B){throw q(!1),B}};if(!A.TP.hasPermission(N.AccessControlAction.LicensingRead))return null;if(r)return(0,e.jsx)(O.a,{text:"Loading licensing info..."});let ce="You are running Grafana Enterprise without a license. The Enterprise features are disabled.";return s&&![f.dO,f.eZ].includes(s.status)&&(ce="There is a problem with your Enterprise license token. The Enterprise features are disabled."),!s||![f.dO,f.eZ].includes(s.status)?(0,e.jsxs)(e.Fragment,{children:[(0,e.jsx)(G.UpgradeInfo,{editionNotice:ce}),(0,e.jsx)("div",{className:W.uploadWrapper,children:(0,e.jsx)(D,{title:"Have a license?",onFileUpload:le,isUploading:$,isDisabled:!ee,licensedUrl:g})})]}):(0,e.jsxs)("div",{children:[(0,e.jsx)("h2",{className:W.title,children:"License details"}),(0,e.jsx)(k,{...X(s,i),orgSlug:s.slug,licenseId:s.lid}),(0,e.jsx)(k,{...K(s),orgSlug:s.slug,licenseId:s.lid}),(0,e.jsx)(k,{...me(s),orgSlug:s.slug,licenseId:s.lid}),u&&(0,e.jsx)(R.F,{title:"License token uploaded. Restart Grafana for the changes to take effect.",severity:"success",onRemove:()=>T.Ny.partial({tokenUpdated:null})}),d&&(0,e.jsx)(R.F,{title:"License token renewed.",severity:"success",onRemove:()=>T.Ny.partial({tokenRenewed:null})}),(0,e.jsxs)("div",{className:W.row,children:[(0,e.jsx)(a,{title:"License",className:W.licenseCard,footer:(0,e.jsx)(C.z9,{variant:"secondary",href:s.details_url||`${s.iss}/licenses/${s.lid}`,"aria-label":"View details about your license in Grafana Cloud",target:"_blank",rel:"noopener noreferrer",children:"License details"}),children:(0,e.jsx)(p,{content:[{name:s.prod?.length<=1?"Product":"Products",value:s.prod?.length<=1?s.prod[0]||"None":(0,e.jsx)("ul",{children:s.prod?.map(B=>(0,e.jsx)("li",{children:B},B))})},s.iss===f.WN&&s.account?{name:"AWS Account",value:s.account}:{name:"Company",value:s.company},{name:"License ID",value:s.lid},s.iss===f.WN?null:{name:"URL",value:s.sub,tooltip:"License URL is the root URL of your Grafana instance. The license will not work on an instance of Grafana with a different root URL."},{name:"Purchase date",value:(0,P.LE)(s.nbf*1e3)},s.iss===f.WN?null:{name:"License expires",value:(0,P.LE)(s.lexp*1e3),highlight:!!K(s)?.state,tooltip:"The license expiration date is the date when the current license is no longer active. As the license expiration date approaches, Grafana Enterprise displays a banner."},s.iss===f.WN?null:{name:"Usage billing",value:s.usage_billing?"On":"Off",tooltip:"You can request Grafana Labs to turn on usage billing to allow an unlimited number of active users. When usage billing is enabled, Grafana does not enforce active user limits or display warning banners. Instead, you are charged for active users above the limit, according to your customer contract."}]})}),(0,e.jsx)(a,{...K(s),title:"Token",footer:(0,e.jsxs)("div",{className:W.row,children:[s.iss!==f.WN&&(0,e.jsx)(D,{onFileUpload:le,isUploading:$,isDisabled:!ee}),w?(0,e.jsx)("span",{children:" (Renewing...)"}):(0,e.jsx)(C.$n,{variant:"secondary",onClick:$e,disabled:!ee,children:"Renew token"})]}),children:(0,e.jsxs)(e.Fragment,{children:[H&&(0,e.jsx)(m,{title:"Contact support to renew your token, or visit the Cloud portal to learn more.",state:H,orgSlug:s.slug,licenseId:s.lid}),(0,e.jsxs)("div",{className:W.message,children:[(0,e.jsx)(S.I,{name:"document-info"}),"Read about"," ",(0,e.jsx)("a",{href:"https://grafana.com/docs/grafana/latest/enterprise/license/license-expiration/",target:"_blank",rel:"noreferrer noopener",children:"license expiration"})," ","and"," ",(0,e.jsx)("a",{href:"https://grafana.com/docs/grafana/latest/enterprise/license/activate-license/",target:"_blank",rel:"noreferrer noopener",children:"license activation"}),"."]}),(0,e.jsx)(p,{content:[{name:"Token ID",value:s.jti},{name:"Token issued",value:(0,P.LE)(s.iat*1e3)},{name:"Token expires",value:(0,P.LE)(s.exp*1e3),highlight:!!K(s)?.state,tooltip:"Grafana automatically updates the token before it expires. If your token is not updating, contact support."}],state:H})]})}),(0,e.jsx)(a,{...X(s,i),title:"Utilization",footer:(0,e.jsx)("small",{className:W.footerText,children:"Utilization of licenced users is determined based on signed-in users' activity in the past 30 days."}),children:(0,e.jsxs)(e.Fragment,{children:[(0,e.jsxs)("div",{className:W.message,children:[(0,e.jsx)(S.I,{name:"document-info"}),"Read about"," ",(0,e.jsx)("a",{href:"https://grafana.com/docs/grafana/latest/enterprise/license/license-restrictions/#active-users-limit",target:"_blank",rel:"noreferrer noopener",children:"active user limits"})," ","and"," ",(0,e.jsx)("a",{href:"https://grafana.com/docs/grafana/latest/enterprise/license/license-restrictions/#concurrent-sessions-limit",target:"_blank",rel:"noreferrer noopener",children:"concurrent session limits"}),"."]}),s.limit_by===f.Bb&&(0,e.jsx)(p,{content:[{name:"Active licensed users",value:ge(s.included_users,oe),highlight:ie(s.included_users,oe)>=f._7},...j.$.bootData.settings.anonymousEnabled?[{name:"Authenticated users",value:i?.active_users||0,indentLevel:1},{name:"Anonymous users",value:Math.floor((i?.active_anonymous_devices||0)/se),tooltip:`For every ${se} anonymous ${se>1?"devices":"device"}, Grafana counts 1 user.`,indentLevel:1}]:[]],state:_})]})})]})]})},fe=s=>({title:(0,o.css)`
      margin: ${s.spacing(4)} 0;
    `,infoText:(0,o.css)`
      font-size: ${s.typography.size.sm};
    `,uploadWrapper:(0,o.css)`
      margin-left: 79px;
    `,row:(0,o.css)`
      display: flex;
      justify-content: space-between;
      width: 100%;
      flex-wrap: wrap;
      gap: ${s.spacing(2)};

      & > div {
        flex: 1 1 340px;
      }
    `,footerText:(0,o.css)`
      margin-bottom: ${s.spacing(2)};
    `,licenseCard:(0,o.css)`
      background: url('/public/img/licensing/card-bg-${s.isLight?"light":"dark"}.svg') center no-repeat;
      background-size: cover;
    `,message:(0,o.css)`
      height: 70px;
      a {
        color: ${s.colors.text.link};

        &:hover {
          text-decoration: underline;
        }
      }

      svg {
        margin-right: ${s.spacing(.5)};
      }
    `}),k=({state:s,message:i,title:d,orgSlug:u,licenseId:r})=>{const g=(0,y.of)(je);return s?(0,e.jsx)(R.F,{title:d,severity:s||void 0,children:(0,e.jsxs)("div",{className:g.container,children:[(0,e.jsxs)("div",{children:[(0,e.jsx)("p",{children:i}),(0,e.jsx)("a",{className:g.link,href:"https://grafana.com/docs/grafana/latest/enterprise/license/license-restrictions/",target:"_blank",rel:"noopener noreferrer",children:"Learn about Enterprise licenses"})]}),(0,e.jsx)(F,{orgSlug:u,licenseId:r})]})}):null},je=s=>({container:(0,o.css)`
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      width: 100%;
    `,link:(0,o.css)`
      font-size: ${s.typography.bodySmall.fontSize};
      text-decoration: underline;
      color: ${s.colors.text.secondary};

      &:hover {
        color: ${s.colors.text.primary};
      }
    `});var ye=t(56784);const re=({queryParams:s})=>{const[i,d]=(0,c.useState)(null),[u,r]=(0,c.useState)(null),[g,$]=(0,c.useState)(!1),{tokenUpdated:h,tokenRenewed:w}=s;return(0,c.useEffect)(()=>A.TP.hasPermission(N.AccessControlAction.LicensingRead)?($(!0),(async()=>{const H=await(0,Z.Pe)().catch(()=>null),_=await(0,Z.o0)().catch(()=>null);d(H),r(_),$(!1)})(),ye.x9):void 0,[]),(0,e.jsx)(L.YW,{navId:"licensing",children:(0,e.jsxs)(L.YW.Contents,{children:[(0,e.jsx)(E.ServerStats,{}),(0,e.jsx)(ve,{token:i,stats:u,tokenUpdated:h,tokenRenewed:w,isLoading:g,licensedUrl:j.$.licenseInfo?.appUrl})]})})},Se=re},51372:(J,b,t)=>{t.r(b),t.d(b,{ServerStats:()=>Y});var e=t(74848),c=t(32196),j=t(96540),L=t(32264),A=t(40845),E=t(55852),N=t(31678),o=t(16233),P=t(70255),T=t(10860),y=t(67061),R=t(56034),C=t(14578);const S=({content:a,footer:x,isLoading:n})=>{const U=(0,A.of)(G);return(0,e.jsxs)(T.Z,{className:U.container,children:[a.map((m,l)=>(0,e.jsxs)(y.B,{justifyContent:"space-between",alignItems:"center",children:[(0,e.jsxs)(y.B,{alignItems:"center",children:[(0,e.jsx)("span",{className:(0,c.cx)({[U.indent]:!!m.indent}),children:m.name}),m.tooltip&&(0,e.jsx)(R.m,{content:String(m.tooltip),placement:"auto-start",children:(0,e.jsx)(C.I,{name:"info-circle",className:U.tooltip})})]}),n?(0,e.jsx)(P.A,{width:60}):(0,e.jsx)("span",{className:m.highlight?U.highlight:"",children:m.value})]},l)),x&&(0,e.jsx)("div",{children:x})]})},G=a=>({container:(0,c.css)({display:"flex",flexDirection:"column",gap:a.spacing(2),padding:a.spacing(2)}),indent:(0,c.css)({marginLeft:a.spacing(2)}),tooltip:(0,c.css)({color:a.colors.secondary.text}),highlight:(0,c.css)({color:a.colors.warning.text,padding:`${a.spacing(.5)} ${a.spacing(1)}`,marginRight:`-${a.spacing(1)}`})});var O=t(17172);const F=async()=>(0,O.AI)().get("api/admin/stats").catch(a=>(console.error(a),null)),Y=()=>{const[a,x]=(0,j.useState)(null),[n,U]=(0,j.useState)(!0),m=(0,A.of)(Q),l=o.TP.hasPermission(N.AccessControlAction.DataSourcesRead),p=o.TP.hasPermission(N.AccessControlAction.UsersRead);return(0,j.useEffect)(()=>{o.TP.hasPermission(N.AccessControlAction.ActionServerStatsRead)&&F().then(v=>{x(v),U(!1)})},[]),o.TP.hasPermission(N.AccessControlAction.ActionServerStatsRead)?(0,e.jsxs)(e.Fragment,{children:[(0,e.jsx)("h2",{className:m.title,children:"Instance statistics"}),!n&&!a?(0,e.jsx)("p",{className:m.notFound,children:"No stats found."}):(0,e.jsxs)("div",{className:m.row,children:[(0,e.jsx)(S,{isLoading:n,content:[{name:"Dashboards (starred)",value:`${a?.dashboards} (${a?.stars})`},{name:"Tags",value:a?.tags},{name:"Playlists",value:a?.playlists},{name:"Snapshots",value:a?.snapshots}],footer:(0,e.jsx)(E.z9,{href:"/dashboards",variant:"secondary",children:"Manage dashboards"})}),(0,e.jsxs)("div",{className:m.doubleRow,children:[(0,e.jsx)(S,{isLoading:n,content:[{name:"Data sources",value:a?.datasources}],footer:l&&(0,e.jsx)(E.z9,{href:"/datasources",variant:"secondary",children:"Manage data sources"})}),(0,e.jsx)(S,{isLoading:n,content:[{name:"Alerts",value:a?.alerts}],footer:(0,e.jsx)(E.z9,{href:"/alerting/list",variant:"secondary",children:"Manage alerts"})})]}),(0,e.jsx)(S,{isLoading:n,content:[{name:"Organisations",value:a?.orgs},{name:"Users total",value:a?.users},{name:"Active sessions",value:a?.activeSessions},{name:"Active users in last 30 days",value:a?.activeUsers},...M(a,L.$)],footer:p&&(0,e.jsx)(E.z9,{href:"/admin/users",variant:"secondary",children:"Manage users"})})]})]}):null},M=(a,x)=>!x.anonymousEnabled||!a?.activeDevices?[]:x.anonymousDeviceLimit?[{name:"Active anonymous devices",value:`${a.activeDevices} / ${x.anonymousDeviceLimit}`,tooltip:"Detected devices that are not logged in, in last 30 days.",highlight:a.activeDevices>x.anonymousDeviceLimit}]:[{name:"Active anonymous devices",value:`${a.activeDevices}`,tooltip:"Detected devices that are not logged in, in last 30 days."}],Q=a=>({title:(0,c.css)({marginBottom:a.spacing(4)}),row:(0,c.css)({display:"flex",justifyContent:"space-between",width:"100%","& > div:not(:last-of-type)":{marginRight:a.spacing(2)},"& > div":{width:"33.3%"}}),doubleRow:(0,c.css)({display:"flex",flexDirection:"column","& > div:first-of-type":{marginBottom:a.spacing(2)}}),notFound:(0,c.css)({fontSize:a.typography.h6.fontSize,textAlign:"center",height:"290px"})})},55356:(J,b,t)=>{t.r(b),t.d(b,{UpgradeInfo:()=>G,UpgradePage:()=>C,default:()=>m});var e=t(74848),c=t(32196),j=t(71468),L=t(40845),A=t(55852),E=t(21780),N=t(17422);const o={fontWeight:500,fontSize:"26px",lineHeight:"123%"},P=l=>{const p=l.isDark?"public/img/licensing/header_dark.svg":"public/img/licensing/header_light.svg",v=l.isDark?l.v1.palette.dark9:l.v1.palette.gray6;return{container:(0,c.css)`
      padding: 36px 79px;
      background: ${l.components.panel.background};
    `,footer:(0,c.css)`
      text-align: center;
      padding: 16px;
      background: ${v};
    `,header:(0,c.css)`
      height: 137px;
      padding: 40px 0 0 79px;
      position: relative;
      background: url('${p}') right;
    `}};function T({header:l,editionNotice:p,subheader:v,children:z}){const D=(0,L.of)(P);return(0,e.jsxs)(e.Fragment,{children:[(0,e.jsxs)("div",{className:D.header,children:[(0,e.jsx)("h2",{style:o,children:l}),v&&(0,e.jsx)("h3",{children:v}),(0,e.jsx)(y,{size:"128px",style:{boxShadow:"0px 0px 24px rgba(24, 58, 110, 0.45)",background:"#0A1C36",position:"absolute",top:"19px",left:"71%"},children:(0,e.jsx)("img",{src:"public/img/grafana_icon.svg",alt:"Grafana",width:"80px",style:{position:"absolute",left:"23px",top:"20px"}})})]}),(0,e.jsx)("div",{className:D.container,children:z}),p&&(0,e.jsx)("div",{className:D.footer,children:p})]})}const y=({size:l,style:p,children:v})=>{const z=(0,L.$j)();return(0,e.jsx)("div",{style:{width:l,height:l,position:"absolute",bottom:0,right:0,borderRadius:z.shape.radius.circle,...p},children:v})};var R=t(51372);function C({navModel:l}){return(0,e.jsx)(E.YW,{navModel:l,children:(0,e.jsxs)(E.YW.Contents,{children:[(0,e.jsx)(R.ServerStats,{}),(0,e.jsx)(G,{editionNotice:`You are running the open-source version of Grafana.
        You have to install the Enterprise edition in order enable Enterprise features.`})]})})}const S={fontWeight:500,fontSize:"26px",lineHeight:"123%"},G=({editionNotice:l})=>{const p=(0,L.of)(O);return(0,e.jsxs)(e.Fragment,{children:[(0,e.jsx)("h2",{className:p.title,children:"Enterprise license"}),(0,e.jsx)(T,{header:"Grafana Enterprise",subheader:"Get your free trial",editionNotice:l,children:(0,e.jsxs)("div",{className:p.column,children:[(0,e.jsx)(Q,{}),(0,e.jsx)(M,{})]})})]})},O=l=>({column:(0,c.css)`
      display: grid;
      grid-template-columns: 100%;
      column-gap: 20px;
      row-gap: 40px;

      @media (min-width: 1050px) {
        grid-template-columns: 50% 50%;
      }
    `,title:(0,c.css)`
      margin: ${l.spacing(4)} 0;
    `}),F=()=>(0,e.jsxs)("div",{style:{marginTop:"40px",marginBottom:"30px"},children:[(0,e.jsx)("h2",{style:S,children:"Get Grafana Enterprise"}),(0,e.jsx)(Y,{}),(0,e.jsx)("p",{style:{paddingTop:"12px"},children:"You can use the trial version for free for 30 days. We will remind you about it five days before the trial period ends."})]}),Y=()=>(0,e.jsx)(A.z9,{variant:"primary",size:"lg",href:"https://grafana.com/contact?about=grafana-enterprise&utm_source=grafana-upgrade-page",children:"Contact us and get a free trial"}),M=()=>(0,e.jsxs)("div",{children:[(0,e.jsx)("h4",{children:"At your service"}),(0,e.jsxs)(x,{children:[(0,e.jsx)(n,{title:"Enterprise Plugins",image:"public/img/licensing/plugin_enterprise.svg"}),(0,e.jsx)(n,{title:"Critical SLA: 2 hours",image:"public/img/licensing/sla.svg"}),(0,e.jsxs)(n,{title:"Unlimited Expert Support",image:"public/img/licensing/customer_support.svg",children:["24 x 7 x 365 support via",(0,e.jsxs)(x,{nested:!0,children:[(0,e.jsx)(n,{title:"Email"}),(0,e.jsx)(n,{title:"Private Slack channel"}),(0,e.jsx)(n,{title:"Phone"})]})]}),(0,e.jsx)(n,{title:"Hand-in-hand support",image:"public/img/licensing/handinhand_support.svg",children:"in the upgrade process"})]}),(0,e.jsxs)("div",{style:{marginTop:"20px"},children:[(0,e.jsx)("strong",{children:"Also included:"}),(0,e.jsx)("br",{}),"Indemnification, working with Grafana Labs on future prioritization, and training from the core Grafana team."]}),(0,e.jsx)(F,{})]}),Q=()=>(0,e.jsxs)("div",{style:{paddingRight:"11px"},children:[(0,e.jsx)("h4",{children:"Enhanced functionality"}),(0,e.jsx)(a,{})]}),a=()=>(0,e.jsxs)(x,{children:[(0,e.jsx)(n,{title:"Data source permissions"}),(0,e.jsx)(n,{title:"Reporting"}),(0,e.jsx)(n,{title:"SAML authentication"}),(0,e.jsx)(n,{title:"Enhanced LDAP integration"}),(0,e.jsx)(n,{title:"Team Sync",children:"LDAP, GitHub OAuth, Auth Proxy, Okta"}),(0,e.jsx)(n,{title:"White labeling"}),(0,e.jsx)(n,{title:"Auditing"}),(0,e.jsx)(n,{title:"Settings updates at runtime"}),(0,e.jsx)(n,{title:"Grafana usage insights",children:(0,e.jsxs)(x,{nested:!0,children:[(0,e.jsx)(n,{title:"Sort dashboards by popularity in search"}),(0,e.jsx)(n,{title:"Find unused dashboards"}),(0,e.jsx)(n,{title:"Dashboard usage stats drawer"}),(0,e.jsx)(n,{title:"Dashboard presence indicators"})]})}),(0,e.jsx)(n,{title:"Enterprise plugins",children:(0,e.jsxs)(x,{nested:!0,children:[(0,e.jsx)(n,{title:"Oracle"}),(0,e.jsx)(n,{title:"Splunk"}),(0,e.jsx)(n,{title:"Service Now"}),(0,e.jsx)(n,{title:"Dynatrace"}),(0,e.jsx)(n,{title:"New Relic"}),(0,e.jsx)(n,{title:"DataDog"}),(0,e.jsx)(n,{title:"AppDynamics"}),(0,e.jsx)(n,{title:"SAP HANA\xAE"}),(0,e.jsx)(n,{title:"Gitlab"}),(0,e.jsx)(n,{title:"Honeycomb"}),(0,e.jsx)(n,{title:"Jira"}),(0,e.jsx)(n,{title:"MongoDB"}),(0,e.jsx)(n,{title:"Salesforce"}),(0,e.jsx)(n,{title:"Snowflake"}),(0,e.jsx)(n,{title:"Wavefront"})]})})]}),x=({children:l,nested:p})=>{const v=(0,c.css)`
    display: flex;
    flex-direction: column;
    padding-top: 8px;

    > div {
      margin-bottom: ${p?0:8}px;
    }
  `;return(0,e.jsx)("div",{className:v,children:l})},n=({children:l,title:p,image:v})=>{const z=v||"public/img/licensing/checkmark.svg",D=(0,c.css)`
    display: flex;

    > img {
      display: block;
      height: 22px;
      flex-grow: 0;
      padding-right: 12px;
    }
  `,V=(0,c.css)`
    font-weight: 500;
    line-height: 1.7;
  `;return(0,e.jsxs)("div",{className:D,children:[(0,e.jsx)("img",{src:z,alt:""}),(0,e.jsxs)("div",{children:[(0,e.jsx)("div",{className:V,children:p}),l]})]})},U=l=>({navModel:(0,N.tc)(l.navIndex,"upgrading")}),m=(0,j.connect)(U)(C)},31906:(J,b,t)=>{t.d(b,{a:()=>L});var e=t(74848),c=t(90613),j=t(39558);const L=({text:A="Loading..."})=>(0,e.jsx)(c.a,{display:"flex",alignItems:"center",direction:"column",justifyContent:"center",paddingTop:10,children:(0,e.jsx)(j._,{text:A})})}}]);

//# sourceMappingURL=LicensePage.7ca845843bfb586f3aa1.js.map