import { JSXComponent, JSXElement, jsx } from "@vertx/jsx";
import "./Dropdowntoggle.scss"

export class DropdownToggle implements JSXComponent {

    title: string
    header:HTMLElement;
    content:HTMLElement;
    toggle() {

        if (this.content.classList.contains("hidden")) {
            console.log("Has hidden")
            this.content.classList.remove("hidden");
        }
        else {
            console.log("No hidden")
            this.content.classList.add("hidden");
        }

    }
    render(children: JSXElement[]): JSXElement {
        this.content = <div class="dropdown-content">{children}</div> as HTMLElement
        return <div class="dropdown-wrapper" >
            <div class="dropdown-header" onclick={() => {this.toggle()}}><h2 class="dropdown-title">{this.title}</h2><h2>v</h2></div>
            {this.content}
            </div>
    }

}