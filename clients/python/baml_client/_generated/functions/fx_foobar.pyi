# This file is generated by the BAML compiler.
# Do not edit this file directly.
# Instead, edit the BAML files and recompile.
#
# BAML version: 0.0.1
# Generated Date: 2023-10-30 01:05:05.765995 -07:00
# Generated by: vbv

from ..types.classes.cls_foo import Foo
from ..types.enums.enm_foo2 import Foo2
from typing import Protocol, runtime_checkable


import typing

import pytest

ImplName = typing.Literal[]

T = typing.TypeVar("T", bound=typing.Callable[..., typing.Any])
CLS = typing.TypeVar("CLS", bound=type)


@runtime_checkable
class IFooBar(Protocol):
    """
    This is the interface for a function.

    Args:
        arg: Foo2

    Returns:
        Foo
    """

    async def __call__(self, arg: Foo2, /) -> Foo:
        ...


class BAMLFooBarImpl:
    async def run(self, arg: Foo2, /) -> Foo:
        ...

class IBAMLFooBar:
    def register_impl(
        self, name: ImplName
    ) -> typing.Callable[[IFooBar], IFooBar]:
        ...

    def get_impl(self, name: ImplName) -> BAMLFooBarImpl:
        ...

    @typing.overload
    def test(self, test_function: T) -> T:
        """
        Provides a pytest.mark.parametrize decorator to facilitate testing different implementations of
        the FooBarInterface.

        Args:
            test_function : T
                The test function to be decorated.

        Usage:
            ```python
            # All implementations will be tested.

            @baml.FooBar.test
            def test_logic(FooBarImpl: IFooBar) -> None:
                result = await FooBarImpl(...)
            ```
        """
        ...

    @typing.overload
    def test(self, *, exclude_impl: typing.Iterable[ImplName]) -> pytest.MarkDecorator:
        """
        Provides a pytest.mark.parametrize decorator to facilitate testing different implementations of
        the FooBarInterface.

        Args:
            exclude_impl : Iterable[ImplName]
                The names of the implementations to exclude from testing.

        Usage:
            ```python
            # All implementations except "" will be tested.

            @baml.FooBar.test(exclude_impl=[""])
            def test_logic(FooBarImpl: IFooBar) -> None:
                result = await FooBarImpl(...)
            ```
        """
        ...

    @typing.overload
    def test(self, test_class: typing.Type[CLS]) -> typing.Type[CLS]:
        """
        Provides a pytest.mark.parametrize decorator to facilitate testing different implementations of
        the FooBarInterface.

        Args:
            test_class : Type[CLS]
                The test class to be decorated.

        Usage:
        ```python
        # All implementations will be tested in every test method.

        @baml.FooBar.test
        class TestClass:
            def test_a(self, FooBarImpl: IFooBar) -> None:
                ...
            def test_b(self, FooBarImpl: IFooBar) -> None:
                ...
        ```
        """
        ...

BAMLFooBar: IBAMLFooBar
