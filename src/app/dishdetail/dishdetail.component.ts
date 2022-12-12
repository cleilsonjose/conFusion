import { Component, OnInit, ViewChild, Inject } from "@angular/core";
import { Params, ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import { Dish } from "../shared/dish";
import { DishService } from "../services/dish.service";
import { Comment } from "../shared/comment";
import { switchMap } from "rxjs/operators";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { visibility, flyInOut, expand } from "../animations/app.animation";


@Component({
  selector: "app-dishdetail",
  templateUrl: "./dishdetail.component.html",
  styleUrls: ["./dishdetail.component.scss"],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
    },
  animations: [
    visibility(),
    flyInOut(),
    expand()
  ],
})
export class DishdetailComponent implements OnInit {
  dish: Dish;
  dishIds: string[];
  dishcopy: Dish;
  prev: string;
  next: string;
  errMess: string;
  commentForm: FormGroup;
  comment: Comment;
  @ViewChild("fform") commentFormDirective;
  visibility = "shown";

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
    private dishService: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    @Inject("BaseURL") private BaseURL
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.dishService.getDishIds().subscribe(
      (dishIds) => (this.dishIds = dishIds),
      (errmess) => (this.errMess = <any>errmess)
    );

    this.route.params
      .pipe(
        switchMap((params: Params) => {
          this.visibility = "hidden";
          return this.dishService.getDish(params["id"]);
        })
      )
      .subscribe(
        (dish) => {
          this.dish = dish;
          this.dishcopy = dish;
          this.setPrevNext(dish.id);
          this.visibility = "shown";
        },
        (errmess) => (this.errMess = <any>errmess)
      );
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
    this.comment.date = new Date().toISOString();

    this.dishcopy.comments.push(this.comment);
    this.dishService.putDish(this.dishcopy).subscribe((dish) => {
      this.dish = dish;
      this.dishcopy = dish;
    });

    this.commentFormDirective.resetForm();
    this.commentForm.reset({
      author: "",
      comment: "",
      rating: "5",
    });
  }
}
