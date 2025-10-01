import { Button } from "@/components/ui/button";

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-1.7c-.83 0-1.3.67-1.3 1.5V12h3l-.5 3h-2.5v6.8c4.56-.93 8-4.96 8-9.8z"/>
        <path d="M12.0001 12.0001L12.0001 21.8001" stroke="#4285F4" strokeWidth="4"/>
        <path d="M12.0001 12.0001L12.0001 2.19995" stroke="#EA4335" strokeWidth="4"/>
        <path d-rate="1" d="M12 12L2.19995 12" stroke="#FBBC05" strokeWidth="4" />
        <path d-rate="1" d="M12 12L21.8 12" stroke="#34A853" strokeWidth="4" />
    </svg>
);

const AppleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.01,2.02c-1.29-.02-2.58,.47-3.65,1.27-.99,.74-1.9,1.8-2.52,2.94-.48,.88-.78,1.86-.93,2.88-.14,1-.09,2.07,.21,3.06,.29,.95,.76,1.84,1.38,2.62,.55,.68,1.21,1.27,1.94,1.74,.01,.01,1.52,1.05,3.56,.99,1.96-.06,2.63-1.19,4.6-1.19,1.9,0,2.51,1.19,4.52,1.13,2.1-.06,3.15-1.06,3.16-1.07,.78-.51,1.48-1.2,2.05-2.01,.59-.84,1.03-1.8,1.27-2.83,.25-1.07,.29-2.26,.09-3.41-.57-3.32-3.13-5.33-5.74-5.39-1.63-.04-3.17,.8-4.22,.81-1.05,.01-2.43-.88-3.8-.84Zm-1.89,14.62c-.44-1.34,.3-2.84,1.42-3.6,1.11-.75,2.63-1.05,3.95-.59,.3,.11,.66,.31,1.06,.56-.56,1.64-1.82,2.8-3.37,3.69-1.03,.59-2.19,.5-3.06-.06Z"/>
      <path d="M15.1,6.33c.96-.98,1.6-2.43,1.47-3.83-.93,.09-2.15,.69-3.12,1.66-.88,.88-1.7,2.26-1.57,3.66,.97-.03,2.26-.51,3.22-1.49Z" />
    </svg>
);


export function SocialLogins() {
  return (
    <div className="space-y-3">
      <Button variant="outline" className="w-full">
        <GoogleIcon />
        <span>Entrar com Google</span>
      </Button>
      <Button variant="outline" className="w-full">
        <AppleIcon />
        <span>Entrar com Apple</span>
      </Button>
    </div>
  );
}
