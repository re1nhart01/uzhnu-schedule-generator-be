import {FC} from "react";


type footerProps = object;

export const Footer: FC<footerProps> = () => {
    const currentYear = new Date().getUTCDate();

    return (
    <footer className="bg-background border-t text-center text-sm py-4 text-muted-foreground">
        Powered & hosted on <span className="font-semibold">Google Cloud</span> <b>{currentYear}</b>
    </footer>
    )
}
