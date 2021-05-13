// Reminder, this is a translation of SdlangSharp, this code is very weird.
export class SdlNamedBased
{
    private _name?: string;
    private _namespace?: string;
    private _namespaceColonIndex?: number;

    constructor(private _qualifiedName: string)
    {
        this.qualifiedName = _qualifiedName;
    }

    public get qualifiedName() : string
    {
        return this._qualifiedName;
    }
    public set qualifiedName(value: string)
    {
        const index = value.indexOf(':');
        if(index >= 0)
            this._namespaceColonIndex = index;
        this._qualifiedName = value;
        this._name = undefined;
        this._namespace = undefined;
    }

    public get name() : string
    {
        if(this._name)
            return this._name;
        else if(this._namespaceColonIndex !== undefined) // idk if JS treats numbers as bools, so this is safer.
        {
            const index = this._namespaceColonIndex + 1;
            this._name = this._qualifiedName.slice(index);
        }
        else
            this._name = this._qualifiedName;
        return this._name;
    }

    public get namespace() : string
    {
        if(this._namespace)
            return this._namespace;
        else if(this._namespaceColonIndex !== undefined)
        {
            this._namespace = this._qualifiedName.slice(0, this._namespaceColonIndex);
            return this._namespace;
        }
        return "";
    }
}