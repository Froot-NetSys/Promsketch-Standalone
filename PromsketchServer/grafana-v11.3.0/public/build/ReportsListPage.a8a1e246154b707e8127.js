"use strict";(self.webpackChunkgrafana=self.webpackChunkgrafana||[]).push([[3057,1517],{7521:(X,p,e)=>{e.d(p,{A:()=>W});var t=e(74848),c=e(32196),j=e(13544),g=e(14578),x=e(42418),u=e(55852),h=e(76442);const m=(0,c.css)({textAlign:"center"}),E=(0,c.css)({maxWidth:"700px",margin:"0 auto"}),W=({title:C,buttonIcon:A,buttonLink:i,buttonTitle:P,buttonDisabled:o,onClick:L,proTip:M,proTipLink:R,proTipLinkTitle:$,proTipTarget:F,infoBox:D,infoBoxTitle:z})=>{const S=()=>(0,t.jsxs)(t.Fragment,{children:[M?(0,t.jsxs)("span",{children:[(0,t.jsx)(g.I,{name:"rocket"}),(0,t.jsxs)(t.Fragment,{children:[" ProTip: ",M," "]}),R&&(0,t.jsx)("a",{href:R,target:F,className:"text-link",children:$})]},"proTipFooter"):"",D?(0,t.jsx)(x.F,{severity:"info",title:z??"",className:E,children:(0,t.jsx)("div",{dangerouslySetInnerHTML:D})}):""]}),K=S()?"":(0,c.css)({marginBottom:"20px"}),b=i?u.z9:u.$n,I=(0,t.jsx)(b,{size:"lg",onClick:L,href:i,icon:A,className:K,"data-testid":j.Tp.components.CallToActionCard.buttonV2(P),disabled:o,children:P});return(0,t.jsx)(h.c,{className:m,message:C,footer:S(),callToActionElement:I})}},59701:(X,p,e)=>{e.r(p),e.d(p,{ReportsListPage:()=>H,default:()=>st});var t=e(74848),c=e(96540),j=e(71468),g=e(32264),x=e(33378),u=e(10354),h=e(14578),m=e(55852),E=e(7521),r=e(21780),W=e(77454),C=e(10096),A=e(35538),i=e(13680),P=e(19065),o=e(32196),L=e(40845),M=e(81507),R=e(56034),$=e(82702),F=e(15626),D=e(65031),z=e(78073),S=e(58949);const K=(s,f)=>{const v=["name","recipients"],y=d=>d.dashboards.some(({dashboard:n})=>n?.name.toLowerCase().includes(f.toLowerCase()));return s.filter(d=>v.some(n=>d[n]?.toLowerCase().includes(f.toLowerCase()))||y(d))},b=s=>new Map([[i.ReportState.Scheduled,s.colors.success.text],[i.ReportState.Expired,s.colors.warning.text],[i.ReportState.Draft,s.colors.text.primary],[i.ReportState.Never,s.colors.text.primary],[i.ReportState.Paused,s.colors.text.disabled]]),I=({deleteReport:s,updateReport:f,reports:v,filter:y})=>{const d=(0,L.$j)(),n=(0,L.of)(J),N=a=>{const l=(0,D.U)(a.state);f({...a,state:l},!0)},Y=C.TP.hasPermission(i.AccessControlAction.ReportingWrite),O=C.TP.hasPermission(i.AccessControlAction.ReportingDelete);return(0,t.jsx)("div",{children:K(v,y).map(a=>{const l=a.recipients.split(";"),T=l.length,Q=(0,z.I5)(a.schedule),{isNever:U,showPlay:B,disableEdit:at,reportState:Z}=(0,D.m)(a),nt=b(d).get(a.state);return(0,t.jsxs)(M.Q,{href:`reports/confirm/${a.id}`,className:n.container,children:[(0,t.jsxs)("div",{className:n.info,children:[(0,t.jsx)("span",{className:n.title,children:a.name}),(0,t.jsx)("span",{className:n.dashboards,children:[...new Set(a.dashboards.map(({dashboard:V})=>V?.name))].join(", ")})]}),(0,t.jsx)("div",{className:n.recipients,children:(0,t.jsx)(R.m,{content:l.join(", "),placement:"top",children:(0,t.jsx)("div",{children:`${T} recipient${T>1?"s":""}`})})}),(0,t.jsxs)("div",{className:n.schedule,children:[(0,t.jsx)("span",{className:(0,o.cx)(n.scheduleStatus,(0,o.css)`
                    color: ${nt};
                  `),children:Z.toUpperCase()}),!U&&(0,t.jsx)("span",{className:n.text,children:Q})]}),(0,t.jsxs)("div",{className:n.buttonWrapper,children:[(0,t.jsx)(R.m,{content:`${B?Z===i.ReportState.Draft?(0,F.U)(a.schedule):"Resume":"Pause"} report`,placement:"top",children:(0,t.jsx)(m.$n,{type:"button",variant:"secondary",fill:"text",icon:B?"play":"pause",size:"md",onClick:V=>{V.preventDefault(),N(a)},disabled:at||!Y||(0,S.a)(a)})}),(0,t.jsx)($.Z,{confirmText:"Delete",confirmVariant:"destructive",size:"md",disabled:!O,onConfirm:()=>s(a),children:(0,t.jsx)(m.$n,{type:"button",className:n.deleteButton,"aria-label":`Delete report ${a.name}`,variant:"secondary",icon:"trash-alt",size:"md",fill:"text"})})]})]},a.id)})})},J=s=>({container:(0,o.css)`
    & > a {
        align-items: center;
      },
    `,info:(0,o.css)`
      display: flex;
      flex-direction: column;
      width: 30%;
    `,title:(0,o.css)`
      font-size: ${s.typography.h5.fontSize};
      font-weight: ${s.typography.fontWeightBold};
    `,dashboards:(0,o.css)`
      font-size: ${s.typography.bodySmall.fontSize};
      color: ${s.colors.text.secondary};
    `,recipients:(0,o.css)`
      display: flex;
      width: 25%;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      },
    `,schedule:(0,o.css)`
      display: flex;
      flex-direction: column;
      width: 40%;
    `,scheduleStatus:(0,o.css)`
      text-transform: uppercase;
    `,buttonWrapper:(0,o.css)`
      display: flex;
      align-items: center;
      width: 5%;
      & > button {
        &[disabled] {
          pointer-events: all;
        },
      },
    `,deleteButton:(0,o.css)`
      &:hover {
        color: ${s.colors.error.text};
    `,text:(0,o.css)`
      color: ${s.colors.text.secondary};
    `});var w=e(47610),k=e(36149),G=e(24631),q=e(19149);function _(s){return{reports:s.reports.reports,hasFetched:s.reports.hasFetchedList,searchQuery:s.reports.searchQuery,reportCount:s.reports.reportCount}}const tt={getReports:G.Q4,deleteReport:G.y8,updateReport:G.A0},et=(0,j.connect)(_,tt),H=({getReports:s,deleteReport:f,updateReport:v,reports:y,reportCount:d,hasFetched:n})=>{const[N,Y]=(0,c.useState)("");(0,c.useEffect)(()=>{s()},[s]);const O=l=>{f(l.id)},a=()=>{const{rendererAvailable:l}=g.$,T=(0,q.D)(),Q=C.TP.hasPermission(i.AccessControlAction.ReportingCreate),U=l&&Q;return(0,x.a)("reports.creation")?(0,t.jsxs)(t.Fragment,{children:[!l&&(0,t.jsx)(P.c,{variant:"error"}),l&&T!==null&&T<3&&(0,t.jsx)(P.E,{}),(0,A.z5)()&&(0,t.jsx)(W.Iz,{featureId:"reporting",eventVariant:"trial",featureName:"reporting",text:"Create unlimited reports during your trial of Grafana Pro."}),d>0?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("div",{className:"page-action-bar",children:(0,t.jsxs)("div",{className:"gf-form gf-form--grow",children:[(0,t.jsx)(u.p,{placeholder:"Search reports by report name, dashboard name or recipients",prefix:(0,t.jsx)(h.I,{name:"search"}),width:56,onChange:B=>Y(B.target.value)}),(0,t.jsx)("div",{className:"page-action-bar__spacer"}),(0,t.jsx)(m.z9,{variant:"primary",href:"reports/new",disabled:!U,icon:"plus",children:"Create a new report"})]})}),(0,t.jsx)(I,{reports:y,deleteReport:O,updateReport:v,filter:N})]}):l&&((0,A.z5)()?(0,t.jsx)(w.ReportUpgradeContent,{action:{text:"Create report",link:"reports/new"}}):(0,t.jsx)(E.A,{title:"You haven't created any reports yet.",buttonIcon:"envelope",buttonLink:"reports/new",buttonTitle:"Create a new report",buttonDisabled:!U,proTip:"",proTipLink:"",proTipLinkTitle:"",proTipTarget:"_blank"}))]}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(k.o,{message:`Creating new reports is not available with an expired license.
              Existing reports continue to be processed but you need to update your license to create a new one.`}),d>0&&(0,t.jsx)(I,{reports:y,deleteReport:O,updateReport:v,filter:N})]})};return(0,t.jsx)(r.YW,{navId:"reports-list",subTitle:"Manage automatically generated PDF reports from any dashboards and have Grafana email them to interested parties.",children:(0,t.jsx)(r.YW.Contents,{isLoading:!n,children:a()})})},st=et(H)},47610:(X,p,e)=>{e.r(p),e.d(p,{ReportUpgradeContent:()=>h,default:()=>E});var t=e(74848),c=e(32196),j=e(40845),g=e(21780),x=e(77454);const u=()=>{const r=(0,j.of)(m);return(0,t.jsxs)(g.YW,{navId:"reports",subTitle:"Manage automatically generated PDF reports from any dashboards and have Grafana email them to interested parties.",children:[(0,t.jsx)("div",{className:r.box,children:(0,t.jsx)(x.Iz,{featureName:"reporting",featureId:"reporting"})}),(0,t.jsx)(g.YW.Contents,{className:r.contents,children:(0,t.jsx)(h,{})}),(0,t.jsx)("div",{className:r.spacer})]})},h=({action:r})=>(0,t.jsx)(x.El,{featureName:"reporting",description:"Reporting allows you to automatically generate PDFs from any of your dashboards and have Grafana email them to interested parties on a schedule.",listItems:["Customize your exact layout and orientation","Personalize with your unique branding","Specify permissions for users across your company","Choose to send a report at custom intervals"],featureUrl:"https://grafana.com/docs/grafana/latest/enterprise/reporting/",image:"reporting-email.png",caption:"Create reports to share your SLO performance, business metrics, cost and utilization metrics or anything else you can express in a Grafana dashboard.",action:r}),m=r=>({contents:(0,c.css)`
      &.page-body {
        flex: 0;
      }
    `,spacer:(0,c.css)`
      flex: 1;
    `,box:(0,c.css)`
      ${r.breakpoints.up("sm")} {
        padding: ${r.spacing(0,1)};
      }

      ${r.breakpoints.up("md")} {
        padding: ${r.spacing(0,2)};
      }
    `}),E=u}}]);

//# sourceMappingURL=ReportsListPage.a8a1e246154b707e8127.js.map