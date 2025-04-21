import { Dialog } from "@mui/material";
import { ReactNode } from "react";


export function Layout({menu, content}: {menu: ReactNode, content: ReactNode}){
  return (
    <div style={{display: "flex", flexDirection: "column", gap: "1em", margin: "1em", height: "100%"}}>
      {menu}

      <div style={{flexGrow: 1}}>
        {content}
      </div>
    </div>
  );
}



export function MyDialog({open, setOpen, title, children}: {open: boolean, setOpen: (open: boolean) => void, title: ReactNode, children: ReactNode}){
  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <div style={{padding: "5px"}}>
        <h1 style={{marginTop: 0}}>{title}</h1>
        {children}
      </div>
    </Dialog>
  );
}
