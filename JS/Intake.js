/**
 * Author: Dade Cook
 * Codepen Demo: https://codepen.io/WretchedDade/pen/aYxXZb
 * GitHub Repository: https://github.com/WretchedDade/Intake.js
 */

class Intake {

    /**
     * 
     * @param {String | HTMLElement} container The element (or selector for it) that should contain the generated input elements.
     * @param {String | HTMLElement} form The form (or selector for it) that contains the container.
     * @param {String | HtmlElement} hiddenInput The element (or selector for it) that should have it's value updated.
     * @param {*} existingValue The existing value to populate the input with
     * @param {DateIntakeOptions | PhoneIntake | ZipCodeIntake} options Options used for generating the input. Type of options defines what time of input will be created.
     */
    constructor(container, form, existingValue, hiddenInput, options) {

        if (typeof container === 'string')
            this.Container = document.querySelector(container);
        else
            this.Container = container;

        this.Container.classList.add('Intake-Container');
        this.Container.setAttribute('tabindex', -1);

        if (typeof form === 'string')
            this.Form = document.querySelector(form);
        else
            this.Form = form;

        if (typeof hiddenInput === 'string')
            this.HiddenInput = document.querySelector(hiddenInput);
        else
            this.HiddenInput = hiddenInput;

        if (!options)
            throw 'Options must be provided to generate Intake Object';

        this.Options = options;

        if (options instanceof DateIntakeOptions)
            this.BaseIntake = new DateIntake(this, existingValue);
        else if (options instanceof PhoneIntakeOptions)
            this.BaseIntake = new PhoneIntake(this, existingValue);
        else if (options instanceof ZipCodeIntakeOptions)
            this.BaseIntake = new ZipCodeIntake(this, existingValue);
        else
            throw 'Unrecognized options provided';
    }

}

class DateIntakeOptions {

    /**
     * 
     * @param {String} format The format the date should be constructed in. Should be similar to 'MM/DD/YYYY'. The text in the format will be used as the placeholder text.
     * @param {String} divider The text to be used to divide the 3 parts of the date.
     */
    constructor(format, divider) {
        this.Format = format;
        this.Divider = divider;
    }
}

class PhoneIntakeOptions {
    /**
     * 
     * @param {'(XXX)XXX-XXXX' | 'XXX-XXX-XXXX'} format Format phone should take.
     * @param {String} placeHolderCharacter Optional. The character to use as the placeholder. Defaults to ' '.
     */
    constructor(format, placeHolderCharacter = ' ') {
        this.Format = format;
        this.PlaceHolderCharacter = placeHolderCharacter.substr(0, 1);
    }
}

class ZipCodeIntakeOptions {

    /**
     * 
     * @param {'USA' | 'Canada'} country The country the postal code input is for.
     * @param {Boolean} isNumeric Optional. If you wish to not provide country you should provide this value to specify if the input should only accept numbers.
     * @param {Number} maxLength Optional. If you wish to not provide country you should provide this value to specify the maximum length the input should accept.
     */
    constructor(country = null, isNumeric = null, maxLength = null) {
        this.Country = country;
        this.IsNumeric = isNumeric;
        this.MaxLength = maxLength;
    }
}

class IntakeBase {

    /**
     * 
     * @param {Intake} parent The parent of this object. Usually an instance of Intake.
     * @param {*} existingValue The value to set the input to by default.
     */
    constructor(parent, existingValue) {
        this.Parent = parent;

        this.GeneratePartGroup();

        this.IntakeParts = [];

        if (!this.GenerateIntakeParts)
            throw 'BaseIntake.GenerateIntakeParts() not implemented by SubClass';

        this.GenerateIntakeParts();

        if (!this.PopulateFromExistingValue)
            throw 'BaseIntake.PopulateFromExistingValue(value) not implemented by SubClass';

        this.PopulateFromExistingValue(existingValue);

        this.GenerateBtnClear();

        var _this = this;

        if (this.BtnClear)
            this.BtnClear.onclick = function () {
                _this.Clear();
            }

        if (this.Parent.Form)
            this.Parent.Form.onsubmit = function () {
                if (_this.UpdateHiddenInputWithFormattedValue)
                    _this.UpdateHiddenInputWithFormattedValue();
                else
                    _this.UpdateHiddenInputWithRawValue();
            }
        
        this.Parent.Container.onblur = function(){
            _this.IntakeParts.forEach(intakePart => {
                if(intakePart instanceof IntakeInput)
                    intakePart.TrimToMaxLength();
            });
        }
    }

    GeneratePartGroup() {
        var partGroup = document.createElement('div');

        partGroup.className = 'Intake-PartGroup';

        this.PartGroup = partGroup;
        this.Parent.Container.appendChild(partGroup);
    }

    GenerateBtnClear() {
        var btnClear = document.createElement('i');
        btnClear.className = 'fas fa-times-circle Intake-BtnClear';

        this.BtnClear = btnClear;
        this.Parent.Container.appendChild(btnClear);
    }

    Clear() {
        this.IntakeParts.forEach(part => {
            if (part instanceof IntakeInput)
                part.Clear();
        });
    }

    UpdateHiddenInputWithRawValue() {
        if (this.Parent.HiddenInput) {
            this.Parent.HiddenInput.value = this.GetRawValue();
            this.FireChangeEvent(this.Parent.HiddenInput);
        }
    }

    FireChangeEvent(element) {

        // dispatch for firefox + others
        if (!document.createEventObject) {
            var evt = document.createEvent("HTMLEvents");

            evt.initEvent('change', true, true);
            return !element.dispatchEvent(evt);
        }

        // dispatch for IE
        return element.fireEvent('onchange', document.createEventObject())
    }

    IsEmpty(value) {
        return value == '';
    }

    GetRawValue() {

        var value = '';

        this.IntakeParts.forEach(intakePart => {
            if (intakePart instanceof IntakeInput)
                value += intakePart.Element.value;
        });

        return value;
    }
}

class DateIntake extends IntakeBase {

    /**
     * 
     * @param {Intake} parent The parent of this object. Usually an instance of Intake.
     * @param {*} existingValue The value to set the input to by default.
     */
    constructor(parent, existingValue) {
        super(parent, existingValue);
    }

    GenerateIntakeParts() {
        var divider = this.Parent.Options.Divider;
        var parts = this.Parent.Options.Format.split(divider);

        var eventsToPrevent = ['paste'];

        this.IntakeParts.push(new NumberIntakeInput(this, parts[0], eventsToPrevent));
        this.IntakeParts.push(new IntakeDivider(this, divider));
        this.IntakeParts.push(new NumberIntakeInput(this, parts[1], eventsToPrevent));
        this.IntakeParts.push(new IntakeDivider(this, divider));
        this.IntakeParts.push(new NumberIntakeInput(this, parts[2], eventsToPrevent));
        
        this.IntakeParts[0].Element.style.marginLeft = "2px";

        this.IntakeParts.forEach(intakePart => {
            this.PartGroup.appendChild(intakePart.Element);
            intakePart.Element.style.textAlign = 'center';
        });

        this.IntakeParts[0].NextPart = this.IntakeParts[2];
        this.IntakeParts[2].NextPart = this.IntakeParts[4];
        this.IntakeParts[2].PreviousPart = this.IntakeParts[0];
        this.IntakeParts[4].PreviousPart = this.IntakeParts[2];
    }

    /**
     * 
     * @param {String} value Value formatted as specified when input was constructed.
     */
    PopulateFromExistingValue(value) {
        var parts = value.split(this.Parent.Options.Divider);

        this.IntakeParts[0].Element.value = parts[0];
        this.IntakeParts[2].Element.value = parts[1];
        this.IntakeParts[4].Element.value = parts[2];
    }

    UpdateHiddenInputWithFormattedValue() {
        if (this.Parent.HiddenInput) {
            this.Parent.HiddenInput.value = this.GetFormattedValue();
            this.FireChangeEvent(this.Parent.HiddenInput);
        }
    }

    GetFormattedValue() {

        var values = [];
        var allComplete = true;

        this.IntakeParts.forEach(intakePart => {
            if (intakePart instanceof IntakeInput) {
                values.push(intakePart.Element.value);
                allComplete = allComplete && intakePart.IsComplete();
            }
        });

        if (allComplete) {
            var divider = this.Parent.Options.Divider;
            return values[0] + divider + values[1] + divider + values[2];
        }

        return '';
    }
}

class PhoneIntake extends IntakeBase {

    /**
     * 
     * @param {Intake} parent The parent of this object. Usually an instance of Intake.
     * @param {*} existingValue The value to set the input to by default. Should be unformatted, similar to 0123456789.
     */
    constructor(parent, existingValue) {
        super(parent, existingValue);
    }

    GenerateIntakeParts() {

        var eventsToPrevent = ['paste'];

        var placeHolderChar = this.Parent.Options.PlaceHolderCharacter;

        if (this.Parent.Options.Format === '(XXX)XXX-XXXX') {
            this.IntakeParts.push(new IntakeDivider(this, '('));
            this.IntakeParts.push(new NumberIntakeInput(this, placeHolderChar.repeat(3), eventsToPrevent));
            this.IntakeParts.push(new IntakeDivider(this, ')'));
            this.IntakeParts.push(new NumberIntakeInput(this, placeHolderChar.repeat(3), eventsToPrevent));
            this.IntakeParts.push(new IntakeDivider(this, '-'));
            this.IntakeParts.push(new NumberIntakeInput(this, placeHolderChar.repeat(4), eventsToPrevent));

            this.IntakeParts[1].NextPart = this.IntakeParts[3];
            this.IntakeParts[3].NextPart = this.IntakeParts[5];
            this.IntakeParts[3].PreviousPart = this.IntakeParts[1];
            this.IntakeParts[5].PreviousPart = this.IntakeParts[3];

        } else if (this.Parent.Options.Format === 'XXX-XXX-XXX') {
            this.IntakeParts.push(new NumberIntakeInput(this, placeHolderChar.repeat(3), eventsToPrevent));
            this.IntakeParts.push(new IntakeDivider(this, '-'));
            this.IntakeParts.push(new NumberIntakeInput(this, placeHolderChar.repeat(3), eventsToPrevent));
            this.IntakeParts.push(new IntakeDivider(this, '-'));
            this.IntakeParts.push(new NumberIntakeInput(this, placeHolderChar.repeat(4), eventsToPrevent));

            this.IntakeParts[0].NextPart = this.IntakeParts[2];
            this.IntakeParts[2].NextPart = this.IntakeParts[4];
            this.IntakeParts[2].PreviousPart = this.IntakeParts[0];
            this.IntakeParts[4].PreviousPart = this.IntakeParts[2];
        } else {
            throw 'Invalid format provided with PhoneIntakeOptions.'
        }        
        
        this.IntakeParts[0].Element.style.marginLeft = "2px";

        this.IntakeParts.forEach(intakePart => {
            this.PartGroup.appendChild(intakePart.Element);
            intakePart.Element.style.textAlign = 'center';
        });
    }

    /**
     * 
     * @param {String} value Raw value with no formatted. Should be similar to 0123456789 
     */
    PopulateFromExistingValue(value) {
        this.IntakeParts[1].Element.value = value.substr(0, 3);
        this.IntakeParts[3].Element.value = value.substr(3, 3);
        this.IntakeParts[5].Element.value = value.substr(6, 4);
    }
}

class ZipCodeIntake extends IntakeBase {

    /**
     * 
     * @param {Intake} parent The parent of this object. Usually an instance of Intake.
     * @param {*} existingValue The value to set the input to by default. Should be unformatted, similar to 0123456789.
     */
    constructor(parent, existingValue) {
        super(parent, existingValue);

        var _this = this;
        this.Parent.Container.onclick = function(){
            _this.IntakeParts[0].Element.focus();
        }
    }

    GenerateIntakeParts() {

        var eventsToPrevent = ['paste'];

        var intakePart;

        if (this.Parent.Options.Country) {
            switch (this.Parent.Options.Country) {
                case 'USA':
                    intakePart = new NumberIntakeInput(this, '     ', eventsToPrevent);
                    break;
                case 'Canada':
                    intakePart = new TextIntakeInput(this, '      ', eventsToPrevent);
                    break;
                default:
                    throw 'Unrecognized Country Provided for ZipCodeIntakeOptions';
            }
        } else if (!this.Parent.Options.MaxLength) {
            throw 'MaxLength must be provided when Country is ommitted from ZipCodeIntakeOptions';
        } else {
            if (this.Parent.Options.IsNumeric)
                intakePart = new NumberIntakeInput(this, ' '.repeat(this.Parent.Options.MaxLength), eventsToPrevent);
            else
                intakePart = new TextIntakeInput(this, ' '.repeat(this.Parent.Options.MaxLength), eventsToPrevent);
        }

        this.IntakeParts.push(intakePart);

        this.IntakeParts.forEach(intakePart => {
            this.PartGroup.appendChild(intakePart.Element);
        });
    }

    /**
     * 
     * @param {String} value Raw value with no formatted. Should be similar to 0123456789 
     */
    PopulateFromExistingValue(value) {
        this.IntakeParts[0].Element.value = value;
        this.IntakeParts[0].TrimToMaxLength();
    }
}

class IntakePartBase {

    /**
     * @param {BaseIntake} parent This Part's Parent Object.
     * @param {Number} maxLength The Max Length for the Object's Value.
     * @param {String} elementType Type of element to create. I.E. Input, P, Button, ...
     */
    constructor(parent, maxLength, elementType) {

        this.Parent = parent;

        this.MaxLength = maxLength;

        this.Element = document.createElement(elementType);

        this.UpdateWidth();
    }
}

class IntakeInput extends IntakePartBase {

    /**
     * @param {IntakeBase} parent The parent object of this divider. Usually an object that extends IntakeBase.
     * @param {String} placeHolder The text to set the PlaceHolder of the created input to.
     * @param {Array<string>} eventsToPrevent A string array of event names that will be have event listeners added to prevent default behavior.
     * @param {String} type Optional. The type to set the input being create to. I.E. text, number, hidden. Text is default.
     * @param {Number} maxLength Optional. The maxlength for the input. If not provided maxlength will be determined by placeHolder.length. Also used to set width.
     */
    constructor(parent, placeHolder, eventsToPrevent, type = 'text', maxLength = null) {
        super(parent, maxLength ? maxLength : placeHolder.length, 'input');

        this.PlaceHolder = placeHolder;

        this.Element.className = 'Intake-Part';
        this.Element.setAttribute('placeholder', this.PlaceHolder);
        this.Element.setAttribute('type', type);

        this.EventsToPrevent = eventsToPrevent;

        this.InitializeListeners();

        this.JustGainedFocus = false;
    }

    UpdateWidth() {
        this.Element.style.width = ((this.MaxLength + 2) * 7.2) + 'px';
    }

    InitializeListeners() {

        this.EventsToPrevent.forEach(event => {
            this.Element.addEventListener(event, function (e) {
                _this.PreventDefault(e);
            });
        });

        var _this = this;

        if (!this.KeyUp)
            throw 'BaseIntakePart.KeyUp(event) not implemented by SubClass';

        if (!this.KeyDown)
            throw 'BaseIntakePart.KeyDown(event) not implemented by SubClass';

        this.Element.onkeyup = function (e) {
            _this.KeyUp(e);
        }

        this.Element.onkeydown = function (e) {
            _this.KeyDown(e);
        }

        this.Element.onclick = function () {
            this.focus();
        };

        this.Element.onfocus = function () {
            _this.JustGainedFocus = true;
        };

        this.Element.onblur = function () {
            _this.TrimToMaxLength();
        }
    }

    PreventDefault(event) {
        event.preventDefault();
    }

    KeyTypeFromEvent(event) {
        var keyCode = event.which || event.keyCode;

        if (!event.shiftKey) {
            if (keyCode == 8)
                return "Backspace";
            else if (keyCode == 9)
                return "Tab";
            else if (keyCode == 37)
                return "LeftArrow";
            else if (keyCode == 38)
                return "UpArrow";
            else if (keyCode == 39)
                return "RightArrow";
            else if (keyCode == 40)
                return "DownArrow";
            else if (keyCode == 46)
                return "Delete";
            else if ((keyCode >= 48 && keyCode <= 57) || (keyCode >= 96 && keyCode <= 105))
                return "Number";
            else if (keyCode == 229)
                return "Android";
        } else {
            if (keyCode == 9)
                return "Shift+Tab";
        }

        return "";
    }

    GoToPrevious() {
        if (this.PreviousPart && this.PreviousPart.Element)
            this.PreviousPart.Element.focus();
    }

    GoToNext() {
        if (this.NextPart && this.NextPart.Element)
            this.NextPart.Element.focus();
    }

    IsEmpty() {
        return !this.Element.value || this.Element.value == '';
    }

    IsAtBegginingOfInput() {
        return this.Element.selectionEnd == 0;
    }

    IsAtEndOfInput() {
        return this.Element.value.length == this.Element.selectionEnd;
    }

    IsComplete() {
        return this.Element.value.length >= this.MaxLength;
    }

    TrimToMaxLength() {
        var currentValue = this.Element.value;
        var newValue = currentValue.substring(0, this.MaxLength);
        this.Element.value = newValue;
    }

    Clear() {
        this.Element.value = '';
    }

    KeyDown(event) {
        this.JustGainedFocus = false;
    }

    KeyUp(event) {
        this.TrimToMaxLength();


        if (this.Parent.UpdateHiddenInputWithFormattedValue)
            this.Parent.UpdateHiddenInputWithFormattedValue();
        else
            this.Parent.UpdateHiddenInputWithRawValue();
    }
}

class NumberIntakeInput extends IntakeInput {

    /**
     * @param {IntakeBase} parent The parent object of this divider. Usually an object that extends IntakeBase.
     * @param {String} placeHolder The text to set the PlaceHolder of the created input to.
     * @param {Array<string>} eventsToPrevent A string array of event names that will be have event listeners added to prevent default behavior.
     */
    constructor(parent, placeHolder, eventsToPrevent) {
        super(parent, placeHolder, eventsToPrevent, 'number', null);
    }

    KeyDown(event) {
        super.KeyDown(event);

        switch (this.KeyTypeFromEvent(event)) {

            case "Shift+Tab":
                if (this.PreviousPart) {
                    this.GoToPrevious();
                    event.preventDefault();
                }
                break;

            case "UpArrow":
            case "DownArrow":
                event.preventDefault();
                break;

            case "Tab":
                if (this.NextPart) {
                    this.GoToNext();
                    event.preventDefault();
                }
                break;

            case "LeftArrow":
                if (this.PreviousPart && (this.IsEmpty() || this.IsAtBegginingOfInput())) {
                    this.GoToPrevious();
                    event.preventDefault();
                }
                break;

            case "RightArrow":
                if (this.NextPart && (this.IsEmpty() || this.IsAtEndOfInput())) {
                    this.GoToNext();
                    event.preventDefault();
                }
                break;

            case "Delete":
                break;

            case "Backspace":
                if (this.IsEmpty())
                    this.GoToPrevious();
                break;

            case "Number":
                if (this.IsComplete())
                    event.preventDefault();
                break;

            default:
                event.preventDefault();
        }
    }

    KeyUp(event) {
        switch (this.KeyTypeFromEvent(event)) {
            case "Shift+Tab":
            case "LeftArrow":
            case "Tab":
            case "RightArrow":
            case "Backspace":
                break;

                //Confirm input is complete and if so and they didn't just get here move them to the next input after enforcing the max length
                //Android is dumb and sends 229 as the keycode, so we have no way of confirming if a numeric key was inputed.
                //We must trust that since we are using an input type of 'Number' that the user only had the option to input numerics.
            case "Android":
            case "Number":
                if (this.IsComplete()) {

                    if (!this.JustGainedFocus)
                        this.GoToNext();

                    event.preventDefault();
                }
        }

        super.KeyUp(event);
    }
}

class TextIntakeInput extends IntakeInput {

    /**
     * @param {IntakeBase} parent The parent object of this divider. Usually an object that extends IntakeBase.
     * @param {String} placeHolder The text to set the PlaceHolder of the created input to.
     * @param {Array<string>} eventsToPrevent A string array of event names that will be have event listeners added to prevent default behavior.
     */
    constructor(parent, placeHolder, eventsToPrevent) {
        super(parent, placeHolder, eventsToPrevent, 'text', null);
    }

    KeyDown(event) {
        super.KeyDown(event);

        switch (this.KeyTypeFromEvent(event)) {

            case "Shift+Tab":
                if (this.PreviousPart) {
                    this.GoToPrevious();
                    event.preventDefault();
                }
                break;

            case "UpArrow":
            case "DownArrow":
                event.preventDefault();
                break;

            case "Tab":
                if (this.NextPart) {
                    this.GoToNext();
                    event.preventDefault();
                }
                break;

            case "LeftArrow":
                if (this.PreviousPart && (this.IsEmpty() || this.IsAtBegginingOfInput())) {
                    this.GoToPrevious();
                    event.preventDefault();
                }
                break;

            case "RightArrow":
                if (this.NextPart && (this.IsEmpty() || this.IsAtEndOfInput())) {
                    this.GoToNext();
                    event.preventDefault();
                }
                break;

            case "Delete":
                break;

            case "Backspace":
                if (this.IsEmpty())
                    this.GoToPrevious();
                break;

            default:
                if (this.IsComplete())
                    event.preventDefault();
                break;
        }
    }

    KeyUp(event) {
        switch (this.KeyTypeFromEvent(event)) {
            case "Shift+Tab":
            case "LeftArrow":
            case "Tab":
            case "RightArrow":
            case "Backspace":
                break;

                /* Confirm input is complete and if so and they didn't just get here move them to the next input after enforcing the max length */
            default:
                if (this.IsComplete()) {

                    if (!this.JustGainedFocus)
                        this.GoToNext();

                    event.preventDefault();
                }
        }

        super.KeyUp(event);
    }
}

class IntakeDivider extends IntakePartBase {

    /**
     * @param {IntakeBase} parent The parent object of this divider. Usually an object that extends IntakeBase.
     * @param {String} text The text to display in the divider's 'p' tag.
     */
    constructor(parent, text) {
        super(parent, text.length, 'p');

        this.Element.className = 'Intake-Part';
        this.Element.innerText = text;
    }

    UpdateWidth() {
        this.Element.style.width = (this.MaxLength * 7.2) + 'px';
    }
}