import { Mesh, Vector3 } from "@babylonjs/core";
import { GameComponentType, iGameComponent } from "./GameObject";
import { FlareGun, Hand, WeaponType, iBaseWeapon } from "../weapons/WeaponController";
import { Player } from "../player/Player";

export class WeaponComponent implements iGameComponent {
    name: string;
    id: string;
    type: GameComponentType;
    weaponType:WeaponType
    icon?: string;
    mesh?: Mesh;
    label?: string;
    canInteract: boolean;
    enabled: boolean;
    weapon:iBaseWeapon;
    owner: Player | null

    constructor(weaponType:WeaponType) {
        this.weaponType = weaponType;
        switch(this.weaponType) {
            case WeaponType.HANDS:
                this.weapon = new Hand();
                break;
            case WeaponType.FLAREGUN:
                this.weapon = new FlareGun();
                break;
        }
    }

    init() {

    }
    interact(args?: any) {

        // if (args instanceof Player) {
        //     let player = args;
        //     this.owner = player;
        //     this.owner.weaponController.availableWeapons.push(this.weapon);
        //     let index = this.owner.weaponController.availableWeapons.indexOf(this.weapon);
        //     if (this.weapon.physicsAggregate) {
        //         this.weapon.physicsAggregate.dispose();
        //     }
        //     this.owner.weaponController.equip(index);
        // }

    }
    endInteract(args?: any) {

    }
    destroy() {

    }
    enable() {

    }
    disable() {

    }
    renderToScene() {

    }

}