/**
 * Describes the shape of the ChangeReports that are passed to Validators.
 */
export declare type ChangeReport = {
    target: any;
    path: string;
    property: string;
} & ({
    type: 'set-prop' | 'delete-prop';
    newValue: any;
} | {
    type: 'function-call';
    function: string;
    arguments: any[];
});
/**
 * Describes the format of a Validator.  Each one must accept a ChangeReport and return whether or not the change should
 * be accepted.
 */
export declare type Validator = (change: ChangeReport) => boolean;
/**
 * Provides simple way to "proxify" nested objects and validate the changes.
 *
 * @author Tanner Nielsen
 */
export declare let Observer: {
    create: (target: any, validator: Validator) => any;
};
