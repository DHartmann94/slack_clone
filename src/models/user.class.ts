export class User {
    name: string;
    email: string;
    status: string = 'Inactive';


    constructor(obj?: any) {
        this.name = obj ? obj.name : '';
        this.email = obj ? obj.email : '';
    }

    public toJSON() {
        return {
            name: this.name,
            email: this.email,
            status: this.status,
        }
    }
}