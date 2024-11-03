export class Utils {
    private constructor(){}
    
    public static mergeDeep(target:any, source: any): any {
        let output = Object.assign({}, target);
        if (this.isObject(target) && this.isObject(source)) {
          Object.keys(source).forEach(key => {
            if (this.isObject(source[key])) {
              if (!(key in target))
                Object.assign(output, { [key]: source[key] });
              else
                output[key] = this.mergeDeep(target[key], source[key]);
            } else {
              Object.assign(output, { [key]: source[key] });
            }
          });
        }
        return output;
    }

    private static isObject(item: any) {
        return (item && typeof item === 'object' && !Array.isArray(item));
    }
}