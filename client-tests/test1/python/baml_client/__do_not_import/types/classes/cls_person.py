# This file is generated by the BAML compiler.
# Do not edit this file directly.
# Instead, edit the BAML files and recompile.
#
# BAML version: 0.0.1
# Generated Date: __DATE__
# Generated by: vbv

from ..enums.enm_persontype import PersonType
from baml_core._impl.deserializer import register_deserializer
from pydantic import BaseModel
from typing import Optional


@register_deserializer()
class Person(BaseModel):
    personType: PersonType
    job: Optional[str] = None
