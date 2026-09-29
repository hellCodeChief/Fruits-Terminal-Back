import { PartialType } from "@nestjs/mapped-types";
import { PropertyValueInsertDTO } from "./propertyValueInsert.dto";

// PartialType would help to use the properties of extended class as optional  
export class PropertyValueUpdateDTO extends PartialType(PropertyValueInsertDTO) { }