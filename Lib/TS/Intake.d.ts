/**
 * Author: Dade Cook
 * Last Updated: May 15th,
 * Documentation: https://wretcheddade.github.io/Intake.js/
 * GitHub Repository: https://github.com/WretchedDade/Intake.js
 */

export class Intake {

    constructor(
        container: String | HTMLElement, 
        form: String | HTMLElement, 
        existingValue: any, 
        hiddenInput: String | HTMLElement, 
        options: DateIntakeOptions | PhoneIntakeOptions | ZipCodeIntakeOptions, 
        callback: Function, 
        widthFactor: Number
    );

    //Properties
    Form: HTMLElement;
    Callback: Function;
    Container: HTMLElement;
    HiddenInput: HTMLElement;
    BaseIntake: DateIntake | PhoneIntake | ZipCodeIntake;
    Options: DateIntakeOptions | PhoneIntakeOptions | ZipCodeIntakeOptions;

    //Methods
    Destroy(): void;
}

export class DateIntakeOptions {

    constructor(
        format: String, 
        divider: String
    );

    //Properties
    Format: String;
    Divider: String;
}

export class PhoneIntakeOptions {

    constructor(
        format: String, 
        placeHolderCharacter: String
    );

    //Properties
    Format: String;
    PlaceHolderCharacter: String;
}

export class ZipCodeIntakeOptions {

    constructor(
        country: String, 
        isNumeric: Boolean, 
        maxLength: Number
    );

    //Properties
    Country: String;
    MaxLength: Number;
    IsNumeric: Boolean;
}

export class IntakeBase {

    constructor(
        parent: Intake, 
        existingValue: any, 
        widthFactor: Number
    );

    //Properties
    Parent: Intake;
    WidthFactor: Number;
    IntakeParts: String[];

    //Methods
    GeneratePartGroup(): void;
    GenerateBtnClear(): void;
    Clear(): void;
    UpdateHiddenInputWithRawValue(): void;
    FireChangeEvent(element: HTMLElement): void;
    IsEmpty(value: String): Boolean;
    GetRawValue(): String;
    GetFirstEmptyIntakeInput(): IntakeInput;
    SelectFirstIntakeInput(): void;
    UpdateBtnClearVisibility(): void;
}

export class DateIntake extends IntakeBase {

    constructor(
        parent: Intake, 
        existingValue: any,
        widthFactor: Number
    );

    //Methods
    GenerateIntakeParts(): void;
    PopulateFromExistingValue(value: String): void;
    UpdateHiddenInputWithFormattedValue(): void;
    GetFormattedValue(): String;
}

export class PhoneIntake extends IntakeBase {

    constructor(
        parent: Intake, 
        existingValue: any,
        widthFactor: Number
    );

    //Methods
    GenerateIntakeParts(): void;
    PopulateFromExistingValue(value: String): void;
}

export class ZipCodeIntake extends IntakeBase {

    constructor(
        parent: Intake, 
        existingValue: any,
        widthFactor: Number
    );

    //Methods
    GenerateIntakeParts(): void;    
    PopulateFromExistingValue(value: String): void;
}

export class IntakePartBase {

    constructor(
        parent: IntakeBase, 
        maxLength: Number, 
        elementType: String,
        widthFactor: Number
    );

    //Properties
    Parent: String;
    MaxLength: Number;
    Element: HTMLElement;
    WidthFactor: Number;

    //Methods
    UpdateWidth(): void;
}

export class IntakeInput extends IntakePartBase {

    constructor(
        parent: IntakeBase, 
        placeHolder: String, 
        eventsToPrevent: String[], 
        type: String, 
        maxLength: Number, 
        widthFactor: Number
    );

    //Properties
    PlaceHolder: String;
    WidthFactor: Number;
    Element: HTMLElement;
    JustGainedFocus: Boolean;
    EventsToPrevent: String[];

    //Methods
    UpdateWidth(): void;
    UpdateTextAlignment: void;
    InitializeListeners(): void;
    PreventDefault(event: Event): void;
    KeyTypeFromEvent(event: Event): String;
    GoToPrevious(): void;
    GoToNext(): void;
    IsEmpty(): Boolean;
    IsAtBegginingOfInput(): Boolean;
    IsAtEndOfInput(): Boolean;
    IsComplete(): Boolean;    
    IsValueHighlighted(): Boolean;
    TrimToMaxLength(): void;
    Clear(): void;
    KeyDown(event: Event): void;
    KeyUp(event: Event): void;
}

export class NumberIntakeInput extends IntakeInput {

    constructor(
        parent: IntakeBase, 
        placeHolder: String, 
        eventsToPrevent: String[],
        widthFactor: Number
    );

    //Properties
    WidthFactor: Number;
    Element: HTMLElement;

    //Methods
    KeyDown(event: Event): void;
    KeyUp(event: Event): void;
}

export class TextIntakeInput extends IntakeInput {

    constructor(
        parent: IntakeBase, 
        placeHolder: String, 
        eventsToPrevent: String[],
        widthFactor: Number
    );

    //Properties
    WidthFactor: Number;
    Element: HTMLElement;

    //Methods
    KeyDown(event: Event): void;
    KeyUp(event: Event): void;
}

export class IntakeDivider extends IntakePartBase {

    constructor(
        parent: IntakeBase, 
        text: String
    );

    //Properties
    Element :HTMLElement;

    //Methods
    UpdateWidth(): void;
}