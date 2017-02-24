// Types of fields
// @author Patrick Terry
import TypeEnum from './TypeEnum'

const TypeConstants = {
  Enum : TypeEnum,

  Array:[TypeEnum.INTEGER, TypeEnum.FLOAT, TypeEnum.SHORT_STRING, TypeEnum.LONG_STRING],

  RequestStrings:['int','float','short_text','long_text'],

  FormattedStrings: ['Integer', 'Float', 'Short Text', 'Long Text'],

  FormattedToRequestMap: {'Integer': 'int', 'Float': 'float','Short Text': 'short_text','Long Text': 'long_text'},
  RequestToFormatMap: {'int': 'Integer', 'float': 'Float','short_text': 'Short Text','long_text': 'Long Text'}
}

export default TypeConstants;
