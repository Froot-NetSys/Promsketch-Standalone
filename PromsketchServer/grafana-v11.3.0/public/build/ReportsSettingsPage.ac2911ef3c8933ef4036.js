"use strict";(self.webpackChunkgrafana=self.webpackChunkgrafana||[]).push([[6962],{14490:(W,u,s)=>{s.r(u),s.d(u,{ReportsSettingsPage:()=>O,default:()=>tt});var t=s(74848),o=s(49785),r=s(16817),R=s(26272),l=s(17172),D=s(32264),b=s(39601),V=s(42418),z=s(55852),I=s(21780),L=s(10096),F=s(13680),G=s(19065),E=s(84167),v=s(88575),A=s(94354),T=s(10354),a=s(32196),$=s(96540),B=s(40845),J=s(67061),Y=s(37270),K=s(73569),H=s(99128),U=s(6089),P=s(77422);const Q=[{label:"Paste URL",value:"url"},{label:"Upload file",value:"file"},{label:"Custom color",value:"color"}];function M({name:e,disabled:n,allowedTypes:g=["url","file"]}){const{control:d,register:h,getValues:y,setValue:p,watch:C,formState:{errors:i}}=(0,o.xW)(),[x]=(0,$.useState)(y()[e]),m=C(e,x),[f,et]=(0,$.useState)((0,U.g)(y()[e])),S=(0,B.of)(X);return(0,t.jsxs)(J.B,{gap:2,direction:"column","data-testid":`resource-picker-${e}`,children:[(0,t.jsx)("div",{children:(0,t.jsx)(A.z,{options:Q.filter(c=>g.includes(c.value)),onChange:c=>{et(c),(0,U.g)(x)===c?p(e,x):p(e,"")},disabled:n,className:S.buttonGroup,value:f})}),f==="file"&&(0,t.jsx)(o.xI,{control:d,name:e,render:({field:{onChange:c,ref:nt,...st}})=>(0,t.jsxs)("div",{className:(0,a.cx)(S.dropzone,n&&S.disabled),children:[(0,t.jsx)(Y.gH,{...st,readAs:"readAsBinaryString",onFileRemove:n?void 0:()=>p(e,""),options:{disabled:n,multiple:!1,accept:{"image/*":[".jpeg",".jpg",".png"]},onDrop:ot=>{c(ot[0])}}}),!(0,U.f)(m)&&m!==""&&(0,t.jsx)(K.I,{removeFile:n?void 0:()=>p(e,""),file:{file:new File([m],m),error:null,id:""}})]})}),f==="url"&&(0,t.jsx)(v.D,{invalid:!!i[e],error:i[e]&&String(i[e]?.message),className:S.customField,children:(0,t.jsx)(T.p,{...h(e,{validate:c=>(0,P.h)(c)||"Invalid URL"}),id:e,placeholder:"https://your.site/image.png",disabled:n})}),f==="color"&&(0,t.jsx)(o.xI,{control:d,name:e,render:({field:c})=>(0,t.jsx)("div",{className:S.pickerContainer,children:(0,t.jsx)(H.i,{...c,id:e,placeholder:"Select color",disabled:n})})})]})}const X=e=>({pickerContainer:(0,a.css)`
      display: flex;
      position: relative;
    `,dropzone:(0,a.css)`
      & > div {
        & > small:first-of-type {
          display: none;
        }
      }
      // FileListItem
      & > div:nth-of-type(2) {
        & > span {
          & > span:nth-of-type(2) {
            display: none;
          }
        }
      }
    `,colorValue:(0,a.css)`
      margin-left: ${e.spacing(1)};
    `,buttonGroup:(0,a.css)`
      margin-bottom: ${e.spacing(2)};
    `,disabled:(0,a.css)`
      div {
        cursor: not-allowed;
      }
    `,customField:(0,a.css)`
      margin-top: -${e.spacing(2)};
    `});var Z=s(53885);const w=e=>e.startsWith("http")?(0,Z.nB)(e):!0,N=({url:e,altText:n,width:g="200px"})=>{const d=(0,B.IS)(k);return e?(0,t.jsx)("div",{className:(0,a.cx)(d.wrapper,(0,a.css)`
          width: ${g};
        `),children:w(e)?(0,t.jsx)("img",{src:e,className:d.img,alt:n}):"Invalid image"}):null},k=e=>({wrapper:(0,a.css)`
      padding: ${e.spacing.sm};
      border: 1px solid ${e.colors.border3};
      border-radius: ${e.border.radius.sm};
      margin-bottom: ${e.spacing.md};
    `,img:(0,a.css)`
      width: 100%;
    `});var j=s(78011);const q=[{label:"Sent By",value:F.FooterMode.SentBy},{label:"None",value:F.FooterMode.None}],_=()=>{const{register:e,control:n,watch:g}=(0,o.xW)(),d=g("reportLogoUrl")||j.xJ,h=g("emailLogoUrl")||j.D3,y=g("emailFooterMode"),p=L.TP.hasPermission(F.AccessControlAction.ReportingSettingsWrite);return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(E.n,{label:"Report branding",disabled:!p,children:[(0,t.jsx)(v.D,{htmlFor:"reportLogoUrl",label:"Company logo URL",description:"The logo will be displayed in the document footer. Supported formats: png, jpg, gif.",children:(0,t.jsx)(M,{name:"reportLogoUrl"})}),(0,t.jsx)(N,{url:d===j.xJ?j.xJ:(0,P.A)(d),width:"60px",altText:"Company logo preview"})]}),(0,t.jsxs)(E.n,{label:"Email branding",disabled:!p,children:[(0,t.jsx)(v.D,{htmlFor:"emailLogoUrl",label:"Company logo URL",description:"The logo will be displayed in the email header. Supported formats: png, jpg, gif.",children:(0,t.jsx)(M,{name:"emailLogoUrl"})}),(0,t.jsx)(N,{url:h===j.D3?j.D3:(0,P.A)(h),altText:"Company logo preview"}),(0,t.jsx)(v.D,{label:"Email footer",children:(0,t.jsx)(o.xI,{name:"emailFooterMode",render:({field:{ref:C,...i}})=>(0,t.jsx)(A.z,{...i,options:q}),control:n})}),y===F.FooterMode.SentBy&&(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(v.D,{label:"Footer link text",children:(0,t.jsx)(T.p,{...e("emailFooterText"),id:"emailFooterText",placeholder:"Grafana",type:"text"})}),(0,t.jsx)(v.D,{label:"Footer link URL",children:(0,t.jsx)(T.p,{...e("emailFooterLink"),id:"emailFooterLink",placeholder:"https://your.site",type:"url"})})]})]})]})},O=()=>{const{value:e,loading:n,error:g}=(0,r.A)(async()=>{const i=await(0,l.AI)().get("/api/reports/settings");return h(i.branding),i}),{handleSubmit:d,reset:h,...y}=(0,o.mN)({mode:"onBlur",defaultValues:e?.branding}),p=i=>{const x=new FormData;for(const[m,f]of Object.entries(i))f instanceof File&&(i={...i,[m]:f.name},x.append("files",f));return x.append("config",JSON.stringify({branding:i})),fetch(`${D.$.appUrl}api/reports/settings`,{method:"POST",body:x}).then(m=>{m.ok?(L.lE.emit(R.r1.alertSuccess,["Successfully saved configuration"]),b.Ny.push("/reports")):L.lE.emit(R.r1.alertError,["Error saving configuration",m.statusText])})};if(g)return(0,t.jsx)(I.YW,{navId:"reports-settings",subTitle:"Manage report template settings.",children:(0,t.jsx)(V.F,{title:"Error loading settings",severity:"error"})});const C=L.TP.hasPermission(F.AccessControlAction.ReportingSettingsWrite);return(0,t.jsx)(I.YW,{navId:"reports-settings",subTitle:"Manage report template settings.",children:(0,t.jsx)(I.YW.Contents,{isLoading:n,children:D.$.rendererAvailable?(0,t.jsx)(o.Op,{...y,reset:h,handleSubmit:d,children:(0,t.jsxs)("form",{onSubmit:d(p),style:{maxWidth:"500px"},children:[(0,t.jsx)(_,{}),(0,t.jsx)(z.$n,{type:"submit",size:"md",variant:"primary",disabled:!C,children:"Save"})]})}):(0,t.jsx)(G.c,{variant:"error"})})})},tt=O},6089:(W,u,s)=>{s.d(u,{f:()=>o,g:()=>t});const t=r=>r?o(r)?"file":r.startsWith("http")||r.startsWith("data:")?"url":r.startsWith("#")||r.startsWith("rgb(")||r.startsWith("rgba(")?"color":"file":"url",o=r=>r instanceof File},77422:(W,u,s)=>{s.d(u,{A:()=>r,h:()=>R});var t=s(78011),o=s(6089);const r=l=>(0,o.f)(l)?URL.createObjectURL(l):(0,o.g)(l)==="file"?`${t.Sw}${l}`:l,R=l=>!l||l instanceof File?!0:typeof l=="string"&&l.startsWith("http")}}]);

//# sourceMappingURL=ReportsSettingsPage.ac2911ef3c8933ef4036.js.map