export class User {
    name: string;
    email: string;
    status: string = 'Inactive';
    picture: string;


    constructor(obj?: any) {
        this.name = obj ? obj.name : '';
        this.email = obj ? obj.email : '';
        this.picture = obj ? obj.picture : '';
    }

    public toJSON() {
        return {
            name: this.name,
            email: this.email,
            status: this.status,
            picture: this.picture,
        }
    }
}