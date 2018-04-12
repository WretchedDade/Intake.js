class Intake {

    /**
     * 
     * @param {String | HTMLElement} container
     * @param {String | HTMLElement} form
     * @param {String | HtmlElement} hiddenInput
     * @param {*} existingValue
     * @param {DateOptions} options
     */
    constructor(container, form, existingValue, hiddenInput, options) {

        if (typeof container === 'string')
            this.Container = document.querySelector(container);
        else
            this.Container = container;

        this.Container.classList.add('Intake-Container');

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

        if (options instanceof DateIntakeOptions) {
            this.BaseIntake = new DateIntake(this, existingValue);
        }
    }

}

class DateIntakeOptions {

    /**
     * 
     * @param {String} format 
     * @param {String} divider 
     */
    constructor(format, divider) {
        this.Format = format;
        this.Divider = divider;
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

        if (this.BtnClear)
            this.BtnClear.onclick = this.Clear();

        if (this.Form)
            this.Form.onsubmit = this.UpdateHiddenInput();
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
        this.IntakeParts.forEach(element => {
            if (element instanceof IntakeInput)
                element.Clear();
        });
    }

    UpdateHiddenInputWithRawValue() {
        if (this.HiddenInput) {
            this.HiddenInput.value = this.GetRawValue();
            this.FireChangeEvent(this.HiddenInput);
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

        this.IntakeParts.forEach(element => {
            if (element instanceof BaseIntakePart)
                value += element.value;
        });

        return value;
    }
}

class DateIntake extends IntakeBase {

    /**
     * 
     * @param {Intake} parent The parent of this object. Usually an instance of Intake.
     * @param {*} existingValue The value to set the input to by default.
     * @param {String} format The format the date should be constructed in. Should be similar to 'MM/DD/YYYY'. The text in the format will be used as the placeholder text.
     * @param {String} divider The text to be used to divide the 3 parts of the date.
     */
    constructor(parent, existingValue) {
        super(parent, existingValue);
    }

    GenerateIntakeParts() {
        var divider = this.Parent.Options.Divider;
        var parts = this.Parent.Options.Format.split(divider);

        var eventsToPrevent = ['paste', 'mousedown'];

        this.IntakeParts.push(new DateIntakeInput(this, parts[0], eventsToPrevent));
        this.IntakeParts.push(new IntakeDivider(this, divider));
        this.IntakeParts.push(new DateIntakeInput(this, parts[1], eventsToPrevent));
        this.IntakeParts.push(new IntakeDivider(this, divider));
        this.IntakeParts.push(new DateIntakeInput(this, parts[2], eventsToPrevent));

        this.IntakeParts.forEach(intakePart => {
            this.PartGroup.appendChild(intakePart.Element);
        });
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
        if (this.HiddenInput) {
            this.HiddenInput.value = this.GetValue();
            this.FireChangeEvent(this.HiddenInput);
        }
    }

    GetFormattedValue() {

        var inputs = [];
        var allComplete = false;

        this.IntakeParts.forEach(intakePart => {
            if (intakePart instanceof IntakeInput) {
                inputs.push(intakePart);
                allComplete = allComplete && intakePart.IsComplete();
            }
        });

        if (allComplete) {
            var divider = this.Parent.Options.Divider;
            return inputs[0] + divider + inputs[1] + divider + inputs[2];
        }

        return '';
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

    UpdateWidth() {
        this.Element.style.width = ((this.MaxLength + 1) * 7.2) + 'px';
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
        this.Element.style.width = ((this.MaxLength + 1) * 7) + 'px';
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
    }

    PreventDefault(event) {
        event.preventDefault();
    }

    KeyTypeFromEvent(event) {
        var keyCode = event.which || event.keyCode;

        if (event.shiftKey) {
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
        throw "Not Implemented";

        // this.PreviousPhonePart.focus();
    }

    GoToNext() {
        throw "Not Implemented";

        // this.NextPhonePart.focus();
    }

    IsEmpty() {
        return !this.Element.value || this.Element.value == '';
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
        this.Parent.UpdateHiddenInput();
    }
}

class DateIntakeInput extends IntakeInput {

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
                if (this.PreviousPhonePartSelector) {
                    this.GoToPrevious();
                    event.preventDefault();
                }
                break;

            case "UpArrow":
            case "DownArrow":
                event.preventDefault();
                break;

            case "Tab":
                if (this.NextPhonePartSelector) {
                    this.GoToNext();
                    event.preventDefault();
                }
                break;

            case "LeftArrow":
                if (this.PreviousPhonePartSelector && this.IsEmpty()) {
                    this.GoToPrevious();
                    event.preventDefault();
                }
                break;

            case "RightArrow":
                if (this.NextPhonePartSelector && (this.IsEmpty() || this.IsAtEndOfInput())) {
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
                if (this.IsComplete() && !this.JustGainedFocus) {
                    if (this.NextPhonePartSelector)
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
}