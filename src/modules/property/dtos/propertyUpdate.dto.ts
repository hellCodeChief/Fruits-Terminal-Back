import { PartialType } from "@nestjs/mapped-types";
import { PropertyInsertDTO } from "./propertyInsert.dto";

// PartialType would help to use the properties of extended class as optional  
export class PropertyUpdateDTO extends PartialType(PropertyInsertDTO) { }