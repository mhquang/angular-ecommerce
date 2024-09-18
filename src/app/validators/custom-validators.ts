import { FormControl, ValidationErrors } from '@angular/forms';

export class CustomValidators {
  // white space validation
  static notOnlyWhitespace(control: FormControl): ValidationErrors {
    // check if stromg only contains whitespace
    if (control.value != null && control.value.trim().length === 0) {
      // invalid, return error object
      return { notOnlyWhitespace: true };
    } else {
      // valid, return null
      return {};
    }
  }
}
