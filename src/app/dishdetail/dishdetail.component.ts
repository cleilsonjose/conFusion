import { Component, OnInit, ViewChild } from "@angular/core";
import { Params, ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import { Dish } from "../shared/dish";
import { DishService } from "../services/dish.service";
import { Comment } from "../shared/comment";
import { switchMap } from "rxjs/operators";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";


@Component({
  selector: "app-dishdetail",
  templateUrl: "./dishdetail.component.html",
  styleUrls: ["./dishdetail.component.scss"],
})
export class DishdetailComponent implements OnInit {
  dish: Dish;
  dishIds: string[];
  prev: string;
  next: string;

  commentForm: FormGroup;

  comment: Comment;
  @ViewChild("fform") commentFormDirective;

  formErrors = {
    author: "",
    comment: "",
    rating: "s",
  };

  validationMessages = {
    author: {
      required: "Name is requied",
      minlength: "Name needs minimum 2 characters",
    },
    comment: {
      required: "Comment is requied",
    },
  };

  constructor(
    private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.dishservice
      .getDishIds()
      .subscribe((dishIds) => (this.dishIds = dishIds));

    this.route.params
      .pipe(
        switchMap((params: Params) => this.dishservice.getDish(params["id"]))
      )
      .subscribe((dish) => {
        this.dish = dish;
        this.setPrevNext(dish.id);
      });
    /*
    const id = this.route.snapshot.params['id'];
    this.dishservice.getDish(id).subscribe(dish => this.dish = dish);
    */
  }

  goBack(): void {
    this.location.back();
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev =
      this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next =
      this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  createForm() {
    this.commentForm = this.fb.group({
      author: ["", [Validators.required, Validators.minLength(2)]],
      rating: ["5"],
      comment: ["", Validators.required, Validators],
    });
    this.commentForm.valueChanges.subscribe((data) =>
      this.onValueChanged(data)
    );
    this.onValueChanged();
  }

  onValueChanged(data?: any) {
    if (!this.commentForm) {
      return;
    }
    const form = this.commentForm;

    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        this.formErrors[field] = "";
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + "";
            }
          }
        }
      }
    }
  }

  onSubmit() {
    this.comment = this.commentForm.value;
    var d = new Date();
    this.comment["date"] = d.toISOString();

    this.dish.comments.push(this.comment);

    this.commentFormDirective.resetForm();

    this.commentForm.reset({
      author: "",
      comment: "",
      rating: "5",
    });
  }
}
