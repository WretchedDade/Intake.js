/**
 * Author: Dade Cook
 * Codepen Demo: https://codepen.io/WretchedDade/pen/aYxXZb
 * GitHub Repository: https://github.com/WretchedDade/Intake.js
 */

export class Intake {
    constructor(container: String | HTMLElement, form: String | HTMLElement, existingValue: any, hiddenInput: String | HTMLElement, options: DateIntakeOptions | PhoneIntake | ZipCodeIntake);

    Destroy(): void;
}

export class DateIntakeOptions {
    constructor(format: String, divider: String);

    Format: String;
    Divider: String;
}

export class PhoneIntakeOptions {
    constructor(format: String, placeHolderCharacter: String);

    Format: String;
    PlaceHolderCharacter: String;
}

export class ZipCodeIntakeOptions {
    constructor(country: String = null, isNumeric: Boolean = null, maxLength: Number = null);

    Country: String;
    MaxLength: Number;
    IsNumeric: Boolean;
}

export class IntakeBase {
    constructor(parent: Intake, existingValue: any);

    Parent: Intake;
    IntakeParts: String[];

    GeneratePartGroup(): void;

    GenerateBtnClear(): void;

    Clear(): void;

    UpdateHiddenInputWithRawValue(): void;

    FireChangeEvent(element: HTMLElement): void;

    IsEmpty(value: String): Boolean;

    GetRawValue(): String;
}

export class DateIntake extends IntakeBase {
    constructor(parent: Intake, existingValue: any);

    GenerateIntakeParts(): void;
    PopulateFromExistingValue(value: String): void;

    UpdateHiddenInputWithFormattedValue(): void;

    GetFormattedValue(): String;
}

export class PhoneIntake extends IntakeBase {
    constructor(parent: Intake, existingValue: any);

    GenerateIntakeParts(): void;

    PopulateFromExistingValue(value: String): void;
}

export class ZipCodeIntake extends IntakeBase {
    constructor(parent: Intake, existingValue: any): void;

    GenerateIntakeParts(): void;
    
    PopulateFromExistingValue(value: String): void;
}

export class IntakePartBase {
    constructor(parent: BaseIntake, maxLength: Number, elementType: String);

    Parent: String;
    MaxLength: Number;
    Element: HTMLElement;
}

export class IntakeInput extends IntakePartBase {
    constructor(parent: Intakebase, placeHolder: String, eventsToPrevent: String[], type: String = 'text', maxLength: Number = null);

    PlaceHolder: String;
    JustGainedFocus: Boolean;
    EventsToPrevent: String[];

    UpdateWidth(): void;

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
    constructor(parent: IntakeBase, placeHolder: String, eventsToPrevent: String[]);

    KeyDown(event: Event): void;

    KeyUp(event: Event): void;
}

export class TextIntakeInput extends IntakeInput {
    constructor(parent: IntakeBase, placeHolder: String, eventsToPrevent: String[]);

    KeyDown(event: Event): void;

    KeyUp(event: Event): void;
}

export class IntakeDivider extends IntakePartBase {
    constructor(parent: IntakeBase, text: String);

    UpdateWidth(): void;
}