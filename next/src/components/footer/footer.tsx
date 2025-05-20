import {FC} from "react";


type footerProps = {};

export const Footer: FC<footerProps> = () => {
    const a = 5;

    return (
    <footer className="bg-background border-t text-center text-sm py-4 text-muted-foreground">
        Powered & hosted on <span className="font-semibold">Google Cloud</span>
    </footer>
    )
}
